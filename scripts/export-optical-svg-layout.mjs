import fs from 'node:fs';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const root = new URL('../', import.meta.url);
const mm = n => +(n * 1000).toFixed(2);
const boards = {};
for (const id of ['tx-a', 'rx-a']) {
  const bytes = fs.readFileSync(new URL(`public/models/laser/${id}.glb`, root));
  const { scene } = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  scene.updateMatrixWorld(true);
  const assembly = scene.children[0];
  const board = assembly.children.find(o => o.userData.pcbLayer === 'pcb');
  const bounds = new Box3().setFromObject(board);
  const components = assembly.children.flatMap(component => {
    if (!/^[A-Z]+\d+$/.test(component.name)) return [];
    if (new Box3().setFromObject(component).max.y < bounds.max.y) return [];
    const local = component.clone();
    local.position.set(0, 0, 0); local.quaternion.identity(); local.scale.set(1, 1, 1);
    local.updateMatrixWorld(true);
    const box = new Box3().setFromObject(local);
    const center = box.getCenter(new Vector3()).applyMatrix4(component.matrixWorld);
    const axis = new Vector3(1, 0, 0).transformDirection(component.matrixWorld);
    return [{ ref: component.name, cx: mm(center.x - bounds.min.x), cy: mm(center.z - bounds.min.z), width: mm(box.max.x - box.min.x), height: mm(box.max.z - box.min.z), angle: +(Math.atan2(axis.z, axis.x) * 180 / Math.PI).toFixed(2) }];
  });
  boards[id] = { width: mm(bounds.max.x - bounds.min.x), height: mm(bounds.max.z - bounds.min.z), components };
  console.log(id, components.length, 'component outlines, retaining CAD rotations');
}
fs.writeFileSync(new URL('src/app/components/optical-board-layout.json', root), JSON.stringify(boards, null, 2) + '\n');
