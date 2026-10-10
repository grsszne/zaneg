import { generateBoard } from './ascii-pcb.mjs';
import { create404Mask } from './pcb-404-mask.mjs';

self.onmessage = ({ data: { width, height, cellAspect } }) => {
  const keepOut = create404Mask(width, height, cellAspect);
  const footprints = [];
  const frames = generateBoard(width, height, Math.random, {
    keepOut,
    footprints,
    fill: true,
    frameStride: Math.max(4, Math.ceil(width * height / 6000)),
  });
  self.postMessage({ frames, footprints });
};
