const INVALID_DRIVE_NAME_CHARACTERS = new Set('<>:"/\\|?*');

export function sanitizeDriveName(value: string, fallback: string) {
  const cleaned = [...value]
    .map((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || INVALID_DRIVE_NAME_CHARACTERS.has(character) ? " " : character;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || fallback;
}

export function safeDriveWebViewLink(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      (url.hostname === "drive.google.com" || url.hostname === "docs.google.com")
    ) {
      return url.toString();
    }
  } catch {
    // Invalid links are omitted from the client response.
  }
  return null;
}
