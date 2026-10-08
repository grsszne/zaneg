// Regenerate the simplified SVG's component envelopes after a STEP/GLB update.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { Box3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const root = new URL("../", import.meta.url);
const bytes = fs.readFileSync(new URL("public/models/laser/usb-interface.glb", root));
const { scene } = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
scene.updateMatrixWorld(true);
const board = scene.getObjectByName("Untitled_PCB");
if (!board) throw new Error("USB interface board outline not found");
const origin = new Box3().setFromObject(board).min;
const mm = value => +(value * 1000).toFixed(2);
const components = scene.children[0].children.flatMap(component => {
  if (!/^[A-Z]+\d+$/.test(component.name)) return [];
  const bounds = new Box3().setFromObject(component);
  if (bounds.max.y < 0.0015) return []; // Exclude underside-only components.
  return [{ ref: component.name, x: mm(bounds.min.x - origin.x), y: mm(bounds.min.z - origin.z),
    width: mm(bounds.max.x - bounds.min.x), height: mm(bounds.max.z - bounds.min.z) }];
});
fs.writeFileSync(fileURLToPath(new URL("src/app/components/usb-board-layout.json", root)), JSON.stringify(components, null, 2) + "\n");
console.log(`Exported ${components.length} component envelopes.`);
