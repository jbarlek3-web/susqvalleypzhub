import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";
import { sanitizeDriveName } from "@/lib/google-drive-core";

export { sanitizeDriveName } from "@/lib/google-drive-core";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const ROOT_FOLDER_NAME = "Field ACQ Projects";
export const MAX_PROJECT_FILE_BYTES = 5 * 1024 * 1024;

type DriveConnectionRow = {
  refresh_token_ciphertext: string;
  refresh_token_iv: string;
  refresh_token_tag: string;
  root_folder_id: string | null;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
  webViewLink?: string;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function encryptionKey() {
  const raw = required("GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY");
  const key = /^[a-f\d]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return key;
}

export function googleDriveConfigured() {
  try {
    required("GOOGLE_DRIVE_CLIENT_ID");
    required("GOOGLE_DRIVE_CLIENT_SECRET");
    encryptionKey();
    return true;
  } catch {
    return false;
  }
}

function encryptRefreshToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

function decryptRefreshToken(row: DriveConnectionRow) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(row.refresh_token_iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(row.refresh_token_tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(row.refresh_token_ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function requestOrigin(request: Request) {
  const configured = process.env.APP_URL?.trim();
  return configured || new URL(request.url).origin;
}

export function googleDriveRedirectUri(request: Request) {
  return new URL("/api/google-drive/callback", requestOrigin(request)).toString();
}

function base64Url(value: Buffer) {
  return value.toString("base64url");
}

function stateHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function googleJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => null)) as
    (T & { error?: { message?: string } | string; error_description?: string }) | null;
  if (!response.ok) {
    const error = payload?.error;
    const message =
      typeof error === "string"
        ? payload?.error_description || error
        : error?.message || `Google request failed (${response.status})`;
    throw new Error(message);
  }
  if (!payload) throw new Error("Google returned an empty response");
  return payload;
}

export async function createGoogleDriveAuthorization(userId: string, request: Request) {
  if (!googleDriveConfigured()) throw new Error("Google Drive is not configured");
  const state = base64Url(randomBytes(32));
  const codeVerifier = base64Url(randomBytes(48));
  const codeChallenge = base64Url(createHash("sha256").update(codeVerifier).digest());
  const sql = await getSql();
  await sql`delete from google_drive_oauth_states where expires_at <= now() or user_id = ${userId}`;
  await sql`
    insert into google_drive_oauth_states (state_hash, user_id, code_verifier, expires_at)
    values (${stateHash(state)}, ${userId}, ${codeVerifier}, now() + interval '10 minutes')
  `;
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", required("GOOGLE_DRIVE_CLIENT_ID"));
  url.searchParams.set("redirect_uri", googleDriveRedirectUri(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", DRIVE_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function completeGoogleDriveAuthorization(
  userId: string,
  request: Request,
  code: string,
  state: string,
) {
  const sql = await getSql();
  const states = await sql<{ code_verifier: string }>`
    delete from google_drive_oauth_states
    where state_hash = ${stateHash(state)} and user_id = ${userId} and expires_at > now()
    returning code_verifier
  `;
  const codeVerifier = states[0]?.code_verifier;
  if (!codeVerifier) throw new Error("Google Drive connection expired or was already used");

  const token = await googleJson<{
    access_token: string;
    refresh_token?: string;
    scope?: string;
  }>(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: required("GOOGLE_DRIVE_CLIENT_ID"),
      client_secret: required("GOOGLE_DRIVE_CLIENT_SECRET"),
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: googleDriveRedirectUri(request),
    }),
  });
  if (!token.refresh_token) throw new Error("Google did not return a Drive refresh token");
  const encrypted = encryptRefreshToken(token.refresh_token);
  await sql`
    insert into google_drive_connections (
      user_id, refresh_token_ciphertext, refresh_token_iv, refresh_token_tag, granted_scope
    ) values (
      ${userId}, ${encrypted.ciphertext}, ${encrypted.iv}, ${encrypted.tag}, ${token.scope || DRIVE_SCOPE}
    )
    on conflict (user_id) do update set
      refresh_token_ciphertext = excluded.refresh_token_ciphertext,
      refresh_token_iv = excluded.refresh_token_iv,
      refresh_token_tag = excluded.refresh_token_tag,
      granted_scope = excluded.granted_scope,
      updated_at = now()
  `;
}

async function connectionFor(userId: string) {
  const sql = await getSql();
  const rows = await sql<DriveConnectionRow>`
    select refresh_token_ciphertext, refresh_token_iv, refresh_token_tag, root_folder_id
    from google_drive_connections where user_id = ${userId}
  `;
  return rows[0] || null;
}

export async function googleDriveStatus(userId: string) {
  if (!googleDriveConfigured()) return { configured: false, connected: false };
  return { configured: true, connected: Boolean(await connectionFor(userId)) };
}

async function accessTokenFor(userId: string) {
  const connection = await connectionFor(userId);
  if (!connection) throw new Error("Connect Google Drive first");
  const token = await googleJson<{ access_token: string }>(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: required("GOOGLE_DRIVE_CLIENT_ID"),
      client_secret: required("GOOGLE_DRIVE_CLIENT_SECRET"),
      refresh_token: decryptRefreshToken(connection),
      grant_type: "refresh_token",
    }),
  });
  return { accessToken: token.access_token, connection };
}

async function createFolder(
  accessToken: string,
  name: string,
  parentId?: string,
  appProperties?: Record<string, string>,
) {
  return googleJson<DriveFile>(`${DRIVE_FILES_URL}?fields=id,name,mimeType,webViewLink`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
      appProperties,
    }),
  });
}

async function ensureRootFolder(
  userId: string,
  accessToken: string,
  connection: DriveConnectionRow,
) {
  if (connection.root_folder_id) return connection.root_folder_id;
  const folder = await createFolder(accessToken, ROOT_FOLDER_NAME, undefined, {
    fieldAcqRoot: "true",
  });
  const sql = await getSql();
  await sql`
    update google_drive_connections set root_folder_id = ${folder.id}, updated_at = now()
    where user_id = ${userId}
  `;
  return folder.id;
}

async function ensureProjectFolder(
  accessToken: string,
  rootFolderId: string,
  projectId: string,
  projectName: string,
) {
  const escapedId = projectId.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
  const escapedRootId = rootFolderId.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
  const query = encodeURIComponent(
    `'${escapedRootId}' in parents and trashed = false and appProperties has { key='fieldAcqProjectId' and value='${escapedId}' }`,
  );
  const result = await googleJson<{ files?: DriveFile[] }>(
    `${DRIVE_FILES_URL}?q=${query}&spaces=drive&fields=files(id,name,mimeType,webViewLink)&pageSize=1`,
    { headers: { authorization: `Bearer ${accessToken}` } },
  );
  if (result.files?.[0]) return result.files[0];
  return createFolder(
    accessToken,
    sanitizeDriveName(projectName, "Untitled project"),
    rootFolderId,
    { fieldAcqProjectId: projectId },
  );
}

function safeMimeType(rawMime: string | undefined): string {
  const candidate = rawMime?.trim();
  if (candidate && /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(candidate)) {
    return candidate;
  }
  return "application/octet-stream";
}

function multipartBody(metadata: Record<string, unknown>, mimeType: string, content: Uint8Array) {
  const boundary = `field_acq_${base64Url(randomBytes(18))}`;
  const verifiedMime = safeMimeType(mimeType);
  const prefix = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: ${verifiedMime}\r\n\r\n`,
  );
  const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
  return {
    boundary,
    body: Buffer.concat([prefix, Buffer.from(content), suffix]),
  };
}

async function uploadToProject(
  userId: string,
  project: { id: string; name: string },
  file: { name: string; mimeType: string; content: Uint8Array },
) {
  const { accessToken, connection } = await accessTokenFor(userId);
  const rootFolderId = await ensureRootFolder(userId, accessToken, connection);
  const projectFolder = await ensureProjectFolder(
    accessToken,
    rootFolderId,
    project.id,
    project.name,
  );
  const multipart = multipartBody(
    {
      name: sanitizeDriveName(file.name, "project-file"),
      parents: [projectFolder.id],
      appProperties: { fieldAcqProjectId: project.id },
    },
    file.mimeType,
    file.content,
  );
  return googleJson<DriveFile>(
    `${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,name,mimeType,webViewLink`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": `multipart/related; boundary=${multipart.boundary}`,
      },
      body: multipart.body,
    },
  );
}

export async function exportProjectToGoogleDrive(
  userId: string,
  project: {
    id: string;
    name: string;
    county: string;
    municipality: string;
    status: string;
    parcelIds: string[];
    acres: number;
    constraints: string[];
  },
) {
  const snapshot = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    source: "Field ACQ Ordinance Aide",
    project,
    notice:
      "This project snapshot does not include or redistribute municipal or county reference documents.",
  };
  const filename = `${sanitizeDriveName(project.name, "Untitled project")} - Field ACQ.json`;
  return uploadToProject(userId, project, {
    name: filename,
    mimeType: "application/json",
    content: Buffer.from(JSON.stringify(snapshot, null, 2), "utf8"),
  });
}

export async function uploadProjectFileToGoogleDrive(
  userId: string,
  project: { id: string; name: string },
  file: File,
) {
  if (file.size < 1 || file.size > MAX_PROJECT_FILE_BYTES) {
    throw new Error("Project files must be between 1 byte and 5 MB");
  }
  return uploadToProject(userId, project, {
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    content: new Uint8Array(await file.arrayBuffer()),
  });
}

export async function disconnectGoogleDrive(userId: string) {
  const connection = await connectionFor(userId);
  const sql = await getSql();
  await sql`delete from google_drive_connections where user_id = ${userId}`;
  await sql`delete from google_drive_oauth_states where user_id = ${userId}`;
  if (!connection) return;
  try {
    const refreshToken = decryptRefreshToken(connection);
    await fetch(GOOGLE_REVOKE_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: refreshToken }),
    });
  } catch {
    // The local connection is already removed. Revocation is best-effort.
  }
}
