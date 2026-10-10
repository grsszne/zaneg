// Condensed, heavy numerals give the empty substrate a readable silhouette.
// Coordinates describe the actual keep-out; nothing is drawn over the board.
const FOUR = [[0.57, 0], [0.87, 0], [0.87, 0.59], [1, 0.59],
  [1, 0.78], [0.87, 0.78], [0.87, 1], [0.61, 1], [0.61, 0.78],
  [0, 0.78], [0, 0.58]];
const FOUR_COUNTER = [[0.27, 0.59], [0.61, 0.59], [0.61, 0.23]];

function inPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inChamferedRect(x, y, left, top, right, bottom, chamfer) {
  if (x < left || x > right || y < top || y > bottom) return false;
  const dx = Math.min(x - left, right - x);
  const dy = Math.min(y - top, bottom - y);
  return dx + dy >= chamfer;
}

export function create404Mask(width, height, cellAspect = 0.6) {
  const mask = new Uint8Array(width * height);
  const glyphHeight = Math.min((height - 8) * 0.56, (width - 24) * cellAspect * 0.88 / 2.04);
  const glyphWidth = glyphHeight * 0.56 / cellAspect;
  const gap = glyphHeight * 0.18 / cellAspect;
  const left = (width - glyphWidth * 3 - gap * 2) / 2;
  const top = (height - glyphHeight) / 2;

  for (let digit = 0; digit < 3; digit++) {
    const offset = left + digit * (glyphWidth + gap);
    for (let row = Math.floor(top); row < top + glyphHeight; row++) {
      for (let col = Math.floor(offset); col < offset + glyphWidth; col++) {
        const x = (col + 0.5 - offset) / glyphWidth;
        const y = (row + 0.5 - top) / glyphHeight;
        const stroke = digit === 1
          ? inChamferedRect(x, y, 0, 0, 1, 1, 0.18) && !inChamferedRect(x, y, 0.27, 0.19, 0.73, 0.81, 0.08)
          : inPolygon(x, y, FOUR) && !inPolygon(x, y, FOUR_COUNTER);
        if (stroke) mask[row * width + col] = 1;
      }
    }
  }
  return mask;
}
