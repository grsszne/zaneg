// Update the commit and release together after publishing a new CAD export.
// Browser requests go directly to these hosts, without a Vercel proxy.
export const LASER_ASSET_COMMIT = "d08d7f54adeec0b196e6750ff64e2db045c7b141";
export const LASER_STEP_RELEASE = "laser-assets-2026-10-31";
export const LASER_MODELS = Object.freeze(["usb-interface", "tx-a", "rx-a", "laser-sled"]);

const modelBase = `https://cdn.jsdelivr.net/gh/grsszne/zaneg@${LASER_ASSET_COMMIT}/public/models/laser`;
const stepBase = `https://github.com/grsszne/zaneg/releases/download/${LASER_STEP_RELEASE}`;

function filename(model, extension) {
  if (!LASER_MODELS.includes(model)) throw new Error(`Unknown laser model: ${model}`);
  return `${model}.${extension}`;
}

export function laserModelUrl(model) {
  return `${modelBase}/${filename(model, "glb")}`;
}

export function laserStepUrl(model) {
  return `${stepBase}/${filename(model, "step")}`;
}

// Keep old bookmarks and asset links working without serving large files here.
// Temporary redirects allow a later export to update the unversioned old URLs.
export function laserAssetRedirects() {
  return LASER_MODELS.flatMap(model => [
    { source: `/models/laser/${model}.glb`, destination: laserModelUrl(model), permanent: false },
    { source: `/models/laser/${model}.step`, destination: laserStepUrl(model), permanent: false },
  ]);
}
