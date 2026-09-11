import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { promisify } from "node:util";

const run = promisify(execFile);
const require = createRequire(import.meta.url);
const tesseractPath = process.env.TESSERACT_JS_PATH;
const pdftoppm = process.env.PDFTOPPM_PATH ?? "pdftoppm";

if (!tesseractPath) {
  throw new Error("Set TESSERACT_JS_PATH to the installed tesseract.js module directory.");
}

const inputs = process.argv.slice(2).map((input) => path.resolve(input));
if (inputs.length === 0) {
  throw new Error("Pass one or more PDF paths to OCR.");
}

const { createWorker } = require(tesseractPath);
const outputDir = path.resolve("src/lib/data/ai-reference-ocr");
await mkdir(outputDir, { recursive: true });

const worker = await createWorker("eng");
try {
  for (const input of inputs) {
    const bytes = await readFile(input);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const renderDir = await mkdtemp(path.join(tmpdir(), "field-acq-ocr-"));
    try {
      const prefix = path.join(renderDir, "page");
      await run(pdftoppm, ["-jpeg", "-r", "180", input, prefix], {
        maxBuffer: 10 * 1024 * 1024,
      });
      const pageFiles = (await readdir(renderDir))
        .filter((name) => name.endsWith(".jpg"))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
      const pages = [];
      for (const [index, pageFile] of pageFiles.entries()) {
        const result = await worker.recognize(path.join(renderDir, pageFile));
        pages.push({ page: index + 1, text: result.data.text.trim() });
      }
      const sidecar = { schemaVersion: 1, sha256, filename: path.basename(input), pages };
      await writeFile(
        path.join(outputDir, `${sha256}.json`),
        `${JSON.stringify(sidecar, null, 2)}\n`,
        "utf8",
      );
      console.log(`OCR ${path.basename(input)}: ${pages.length} pages`);
    } finally {
      await rm(renderDir, { recursive: true, force: true });
    }
  }
} finally {
  await worker.terminate();
}
