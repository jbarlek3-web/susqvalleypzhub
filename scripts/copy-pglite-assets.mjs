#!/usr/bin/env node
/** Nitro's Vercel output looks for pglite.data next to the bundled pglite mjs. */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const srcDir = join(process.cwd(), "node_modules/@electric-sql/pglite/dist");
const destDir = join(
  process.cwd(),
  ".vercel/output/functions/__server.func/_libs",
);

if (!existsSync(destDir)) {
  process.exit(0);
}
mkdirSync(destDir, { recursive: true });
for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const from = join(srcDir, name);
  if (!existsSync(from)) continue;
  copyFileSync(from, join(destDir, name));
}
console.log("copied pglite runtime assets ->", destDir);
