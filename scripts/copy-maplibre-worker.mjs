import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Next.js must serve the worker and its shared module together.
// https://maplibre.org/maplibre-gl-js/docs/#esm
const packageRoot = path.dirname(createRequire(import.meta.url).resolve("maplibre-gl/package.json"));
const destination = fileURLToPath(new URL("../public/maplibre/", import.meta.url));
mkdirSync(destination, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(path.join(packageRoot, "dist", file), path.join(destination, file));
}
copyFileSync(path.join(packageRoot, "LICENSE.txt"), path.join(destination, "LICENSE.txt"));
