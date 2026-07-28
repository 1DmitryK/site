import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const required = [
  "index.html",
  "styles.css",
  "app.js",
  "data/materials.json",
  "data/perfumes.json",
  "data/accords.json",
  "data/content.json",
  "data/ru.json"
];

for (const file of required) {
  const content = await readFile(resolve(root, file), "utf8");
  if (!content.trim()) throw new Error(`${file} is empty`);
  if (file.endsWith(".json")) JSON.parse(content);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const item of ["index.html", "styles.css", "app.js", "data"]) {
  await cp(resolve(root, item), resolve(dist, item), { recursive: true });
}

console.log(`Built ${required.length} validated assets into dist/`);
