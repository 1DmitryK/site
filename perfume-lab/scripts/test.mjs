import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const [html, app, materials, perfumes, accords, content, ru] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "app.js"), "utf8"),
  readFile(resolve(root, "data/materials.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "data/perfumes.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "data/accords.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "data/content.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "data/ru.json"), "utf8").then(JSON.parse)
]);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(html.includes('id="app"'), "App mount point is missing");
assert(html.includes('id="search-dialog"'), "Search dialog is missing");
assert(app.includes("window.addEventListener(\"hashchange\""), "Hash routing is missing");
assert(materials.length === 36, `Expected 36 recorded oils, found ${materials.length}`);
assert(new Set(materials.map((item) => item.id)).size === materials.length, "Material IDs must be unique");
assert(perfumes.length >= 4, "Expected first perfume studies");
assert(perfumes.every((item) => item.privacy && !("parts" in item) && !("drops" in item)), "Public perfume records must not expose exact ratios");
assert(accords.every((item) => !("parts" in item) && !("drops" in item)), "Public accord records must not expose exact ratios");
assert(content.molecules.length >= 5, "Molecule shortlist is incomplete");
assert(content.experiments.length >= 3, "Experiment list is incomplete");
assert(content.journal.length >= 3, "Journal is incomplete");
assert(content.knowledge.length >= 6, "Knowledge base is incomplete");
assert(html.includes('data-language="ru"'), "Russian language switch is missing");
assert(app.includes("perfume-lab-language"), "Language preference persistence is missing");
assert(app.includes('href="#oil/'), "Ingredient detail links are missing");
assert(app.includes("function oilView"), "Material detail route is missing");
assert(app.includes("Used in"), "Reverse usage links are missing");
assert(Object.keys(ru).length >= 140, "Russian translation catalogue is incomplete");

console.log("All privacy, data integrity and app structure checks passed");
