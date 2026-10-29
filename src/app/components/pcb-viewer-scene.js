import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function disposeModel(model) {
  model.traverse(object => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(material => material?.dispose());
  });
}

export function mountPcbViewer(host, { url, label, helpId, annotations = [], onPins = () => {}, onReady, onError, onViewChange, assembly = false }) {
  let disposed = false;
  let model;
  let distance = 1;
  let anchors = [];
  let modelBounds;
  let assemblyBounds;
  let activeView = "isometric";
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.001, 10);
  camera.up.set(0, 0, 1);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.32;
  scene.environmentRotation.x = Math.PI / 2;
  room.dispose();
  pmrem.dispose();
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", `${label} 3D model`);
  canvas.setAttribute("aria-describedby", helpId);
  host.appendChild(canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.zoomSpeed = 0.7;
  controls.rotateSpeed = 0.7;
  const ambient = new THREE.HemisphereLight(0xffffff, 0x99958b, 0.3);
  ambient.position.set(0, 0, 1);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
  keyLight.position.set(0.08, -0.12, 0.18);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  Object.assign(keyLight.shadow.camera, { left: -0.08, right: 0.08, top: 0.08, bottom: -0.08, near: 0.01, far: 0.5 });
  keyLight.shadow.bias = -0.00005;
  keyLight.shadow.normalBias = 0.000035;
  keyLight.shadow.camera.updateProjectionMatrix();
  scene.add(keyLight);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-2, 1, -1);
  scene.add(fill);

  function render() {
    if (disposed) return;
    renderer.render(scene, camera);
    if (anchors.length) onPins(anchors.map(({ ref, point }) => {
      const projected = point.clone().project(camera);
      return { ref, x: (projected.x + 1) * 50, y: (1 - projected.y) * 50,
        visible: camera.position.z > point.z && Math.abs(projected.x) < 0.95 && Math.abs(projected.y) < 0.92 && projected.z < 1 };
    }));
  }
  function showCopper(visible) {
    model?.traverse(object => {
      if (["soldermask", "silkscreen"].includes(object.userData.pcbLayer)) object.visible = !visible;
    });
    render();
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height || disposed) return;
    renderer.setSize(width, height, false);
    const previousAspect = camera.aspect;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (assembly && modelBounds && activeView !== "custom" && previousAspect !== camera.aspect) setView(activeView);
    render();
  }
  function setView(view) {
    activeView = view;
    if (assembly && modelBounds) {
      const bounds = view === "full" ? modelBounds : assemblyBounds;
      const sphere = bounds.getBoundingSphere(new THREE.Sphere());
      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      controls.target.copy(sphere.center);
      const direction = view === "top" ? new THREE.Vector3(0, -0.001, 1)
        : view === "front" ? new THREE.Vector3(0, 1, 0.08)
        : new THREE.Vector3(0.9, 1.25, 1.15);
      direction.normalize();
      const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
      const up = new THREE.Vector3().crossVectors(direction, right).normalize();
      // Fit all eight box corners in camera space, including on narrow screens.
      // A bounding sphere leaves excessive space around the long, thin rail.
      distance = 0;
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) {
            const corner = new THREE.Vector3(x, y, z).sub(sphere.center);
            const depth = corner.dot(direction);
            distance = Math.max(distance,
              Math.abs(corner.dot(right)) / (Math.tan(halfFov) * camera.aspect) + depth,
              Math.abs(corner.dot(up)) / Math.tan(halfFov) + depth);
          }
        }
      }
      distance *= 1.12;
      camera.position.copy(controls.target).add(direction.multiplyScalar(distance));
      controls.update();
      render();
      return;
    }
    controls.target.set(0, 0, 0);
    if (view === "top") camera.position.set(0, -distance * 0.001, distance);
    else if (view === "bottom") camera.position.set(0, -distance * 0.001, -distance);
    else camera.position.set(0.55, -0.8, 1).normalize().multiplyScalar(distance);
    controls.update();
    render();
  }
  function zoom(factor) {
    if (!model) return;
    activeView = "custom";
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(offset);
    controls.update();
    render();
  }
  function keyDown(event) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "Home"].includes(event.key)) return;
    if (!model) return;
    event.preventDefault();
    if (event.key === "+" || event.key === "=") return zoom(1 / 1.2);
    if (event.key === "-") return zoom(1.2);
    if (event.key === "Home") { setView("isometric"); onViewChange("isometric"); return; }
    activeView = "custom";
    const axis = new THREE.Vector3(1, 0, 0);
    const offset = camera.position.clone().sub(controls.target).applyAxisAngle(axis, -Math.PI / 2);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    if (event.key === "ArrowLeft") spherical.theta -= 0.15;
    if (event.key === "ArrowRight") spherical.theta += 0.15;
    if (event.key === "ArrowUp") spherical.phi -= 0.15;
    if (event.key === "ArrowDown") spherical.phi += 0.15;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.01, Math.PI - 0.01);
    offset.setFromSpherical(spherical).applyAxisAngle(axis, Math.PI / 2);
    camera.position.copy(controls.target).add(offset);
    controls.update();
    onViewChange("custom");
    render();
  }
  // Page scrolling stays available until the reader focuses or touches a model.
  function activate() { controls.enableZoom = true; }
  function deactivate() { controls.enableZoom = false; }
  function startOrbit() { activeView = "custom"; onViewChange("custom"); }
  function contextLost(event) { event.preventDefault(); if (!disposed) onError(); }
  canvas.addEventListener("pointerdown", activate, true);
  canvas.addEventListener("focus", activate);
  canvas.addEventListener("blur", deactivate);
  canvas.addEventListener("pointerleave", deactivate);
  canvas.addEventListener("keydown", keyDown);
  canvas.addEventListener("webglcontextlost", contextLost);
  controls.addEventListener("change", render);
  controls.addEventListener("start", startOrbit);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  new GLTFLoader().loadAsync(url).then(gltf => {
    if (disposed) { disposeModel(gltf.scene); return; }
    model = gltf.scene;
    // glTF uses Y-up; the board controls use the original CAD Z-up convention.
    model.rotation.x = Math.PI / 2;
    model.position.sub(new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3()));
    // STEP supplies colors, but no surface finish. Preserve those colors while
    // giving resin, molded packages, and exposed metal different reflections.
    const sourceMaterials = new Set();
    model.traverse(object => {
      if (!object.isMesh) return;
      const layer = object.userData.pcbLayer || object.parent?.userData.pcbLayer;
      object.castShadow = !["silkscreen", "soldermask", "copper", "pad", "via"].includes(layer);
      object.receiveShadow = true;
      const finish = original => {
        sourceMaterials.add(original);
        const material = new THREE.MeshPhysicalMaterial();
        THREE.MeshStandardMaterial.prototype.copy.call(material, original);
        material.defines = { STANDARD: "", PHYSICAL: "" };
        const { r, g, b } = material.color;
        const metal = assembly
          ? Math.min(r, g, b) > 0.25 && Math.max(r, g, b) - Math.min(r, g, b) < 0.12
          : ["copper", "pad", "via"].includes(layer) || (!layer && r > 0.3 && g > 0.25 && b < r * 1.05);
        material.metalness = metal ? 0.8 : 0;
        material.roughness = metal ? 0.3 : 0.62;
        if (layer === "soldermask") {
          material.roughness = 0.36;
          material.clearcoat = 0.2;
          material.clearcoatRoughness = 0.3;
          // An opaque finish avoids washing the mask out with the copper below;
          // the copper control explicitly removes this layer when inspecting it.
          material.opacity = 1;
          material.transparent = false;
          material.depthWrite = true;
        } else if (layer === "silkscreen") {
          material.roughness = 0.85;
          material.depthWrite = false;
        } else if (!layer && Math.max(r, g, b) < 0.04) {
          material.roughness = 0.48;
        }
        return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(finish) : finish(object.material);
    });
    sourceMaterials.forEach(material => material.dispose());
    scene.add(model);
    model.updateMatrixWorld(true);
    if (assembly) {
      modelBounds = new THREE.Box3().setFromObject(model);
      assemblyBounds = new THREE.Box3();
      model.traverse(object => {
        if (!object.isMesh) return;
        // Keep the exported rail intact, but frame the hardware on Reset.
        for (let part = object; part; part = part.parent) {
          if (part.userData.mechanicalRole === "rail") return;
        }
        assemblyBounds.union(new THREE.Box3().setFromObject(object));
      });
      if (assemblyBounds.isEmpty()) assemblyBounds.copy(modelBounds);
      const focus = assemblyBounds.getBoundingSphere(new THREE.Sphere());
      const full = modelBounds.getBoundingSphere(new THREE.Sphere());
      const lightScale = focus.radius;
      keyLight.position.copy(focus.center).add(new THREE.Vector3(2, -3, 5).multiplyScalar(lightScale));
      keyLight.target.position.copy(focus.center);
      scene.add(keyLight.target);
      Object.assign(keyLight.shadow.camera, {
        left: -lightScale * 1.7, right: lightScale * 1.7,
        top: lightScale * 1.7, bottom: -lightScale * 1.7,
        near: lightScale * 0.05, far: lightScale * 12,
      });
      keyLight.shadow.normalBias = lightScale * 0.0005;
      keyLight.shadow.camera.updateProjectionMatrix();
      camera.far = Math.max(10, full.radius * 30);
      camera.updateProjectionMatrix();
      controls.minDistance = focus.radius * 0.3;
      controls.maxDistance = full.radius * 30;
    }
    anchors = annotations.flatMap(({ ref }) => {
      const component = model.getObjectByName(ref);
      if (!component) return [];
      const bounds = new THREE.Box3().setFromObject(component);
      const point = bounds.getCenter(new THREE.Vector3());
      point.z = bounds.max.z + 0.0006;
      return [{ ref, point }];
    });
    const sphere = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
    distance = sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.1;
    if (!assembly) {
      controls.minDistance = sphere.radius * 1.1;
      controls.maxDistance = distance * 3;
    }
    setView("isometric");
    onViewChange("isometric");
    onReady();
  }).catch(() => { if (!disposed) onError(); });

  return {
    setView, zoom, showCopper,
    dispose() {
      disposed = true;
      observer.disconnect();
      canvas.removeEventListener("pointerdown", activate, true);
      canvas.removeEventListener("focus", activate);
      canvas.removeEventListener("blur", deactivate);
      canvas.removeEventListener("pointerleave", deactivate);
      canvas.removeEventListener("keydown", keyDown);
      canvas.removeEventListener("webglcontextlost", contextLost);
      controls.removeEventListener("change", render);
      controls.removeEventListener("start", startOrbit);
      controls.dispose();
      if (model) disposeModel(model);
      keyLight.shadow.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
