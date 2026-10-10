// Fine ASCII geometry: package pads and component keep-outs share a grid
// with a bend-aware copper router. Frames preserve IC / passive / trace order.
export const BOARD_ROWS = 64;

class Heap {
  items = [];
  push(item) {
    let i = this.items.length;
    this.items.push(item);
    while (i) {
      const parent = (i - 1) >> 1;
      if (this.items[parent].score <= item.score) break;
      this.items[i] = this.items[parent]; i = parent;
    }
    this.items[i] = item;
  }
  pop() {
    const first = this.items[0], last = this.items.pop();
    if (this.items.length) {
      let i = 0;
      while (i * 2 + 1 < this.items.length) {
        let child = i * 2 + 1;
        if (child + 1 < this.items.length && this.items[child + 1].score < this.items[child].score) child++;
        if (this.items[child].score >= last.score) break;
        this.items[i] = this.items[child]; i = child;
      }
      this.items[i] = last;
    }
    return first;
  }
}

const D = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

export function generateBoard(width, height = BOARD_ROWS, random = Math.random, options = {}) {
  width = Math.max(100, Math.floor(width));
  const size = width * height;
  const layers = { components: Array(size).fill(' '), copper: Array(size).fill(' '), substrate: Array(size).fill(' ') };
  const keepOut = options.keepOut;
  const blocked = keepOut ? Uint8Array.from(keepOut) : new Uint8Array(size);
  const parts = [], pads = [], frames = [];
  const idx = (x, y) => y * width + x;
  const captureFootprint = (x, y, width, height, kind) => {
    if (!options.footprints) return;
    const cells = [];
    // Record actual pads and body cells, not the empty corners of a package.
    // Later passives can occupy those corners without becoming part of the IC.
    for (let yy = y; yy < y + height; yy++) {
      for (let xx = x; xx < x + width; xx++) {
        if (layers.components[idx(xx, yy)] !== ' ') cells.push((yy - y) * width + xx - x);
      }
    }
    options.footprints.push({ x, y, width, height, kind, cells });
  };
  const r = (a, b) => a + Math.floor(random() * (b - a + 1));
  const inside = (x, y) => x > 3 && x < width - 4 && y > 2 && y < height - 3;
  const lines = cells => Array.from({ length: height }, (_, y) => cells.slice(y * width, (y + 1) * width).join('')).join('\n');
  let snapshotCount = 0;
  const snapshot = (force = false) => {
    if (!force && snapshotCount++ % (options.frameStride ?? 1) !== 0) return;
    frames.push(Object.fromEntries(Object.entries(layers).map(([name, cells]) => [name, lines(cells)])));
  };
  const put = (layer, x, y, text) => [...text].forEach((char, i) => { if (x + i >= 0 && x + i < width && y >= 0 && y < height) layers[layer][idx(x + i, y)] = char; });
  function fits(x, y, w, h, margin = 2) {
    const edgeX = options.fill ? 3 : 7, edgeY = options.fill ? 2 : 5;
    if (x < edgeX || y < edgeY || x + w > width - edgeX || y + h > height - edgeY) return false;
    for (let yy = y - margin; yy < y + h + margin; yy++) {
      for (let xx = x - margin; xx < x + w + margin; xx++) {
        const p = idx(xx, yy);
        // Keep clearance between parts, but let their actual footprints meet
        // the invisible lettering without adding an extra halo of whitespace.
        if (blocked[p] && (!keepOut?.[p] || (xx >= x && xx < x + w && yy >= y && yy < y + h))) return false;
      }
    }
    return true;
  }
  function rect(x, y, w, h, fill, layer = 'components') {
    for (let yy = y; yy < y + h; yy++) put(layer, x, yy, fill.repeat(w));
  }
  function reserve(x, y, w, h) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) blocked[idx(xx, yy)] = 1;
  }
  function terminal(part, x, y, direction) {
    const pad = { x, y, direction, part, used: false };
    pads.push(pad); part.pads.push(pad);
  }
  const chipFits = (x, y, w, h, type) => {
    const padX = keepOut && type === 'horizontal' ? 0 : 4;
    const padY = keepOut && type === 'dual' ? 0 : 3;
    return fits(x - padX, y - padY, w + padX * 2, h + padY * 2);
  };
  function chip(x, y, w, h, type) {
    if (!chipFits(x, y, w, h, type)) return null;
    const part = { x, y, w, h, type, pads: [] };
    parts.push(part);
    reserve(x, y, w, h);
    rect(x, y, w, h, ':');
    put('components', x, y, '.' + '-'.repeat(w - 2) + '.');
    put('components', x, y + h - 1, "'" + '-'.repeat(w - 2) + "'");
    for (let yy = y + 1; yy < y + h - 1; yy++) { put('components', x, yy, '|'); put('components', x + w - 1, yy, '|'); }
    put('components', x + 2, y + 2, 'o');
    if (type !== 'horizontal') {
      for (let yy = y + 2; yy < y + h - 2; yy += (type === 'quad' ? 1 : 2)) {
        rect(x - 3, yy, 3, 1, '='); rect(x + w, yy, 3, 1, '=');
        reserve(x - 3, yy, 3, 1); reserve(x + w, yy, 3, 1);
        terminal(part, x - 4, yy, 4); terminal(part, x + w + 3, yy, 0);
      }
    }
    if (type === 'quad' || type === 'horizontal') {
      for (let xx = x + 3; xx < x + w - 3; xx += (type === 'quad' ? 2 : 3)) {
        rect(xx, y - 2, 1, 2, '|'); rect(xx, y + h, 1, 2, '|');
        reserve(xx, y - 2, 1, 2); reserve(xx, y + h, 1, 2);
        terminal(part, xx, y - 3, 6); terminal(part, xx, y + h + 2, 2);
      }
    }
    const pinX = type === 'horizontal' ? 0 : 3;
    const pinY = type === 'dual' ? 0 : 2;
    captureFootprint(x - pinX, y - pinY, w + pinX * 2, h + pinY * 2, 'ic');
    snapshot();
    return part;
  }
  const mainWidth = width > 200 ? 38 : 29;
  let main = chip(Math.floor(width * 0.44) - Math.floor(mainWidth / 2), 22 + r(-2, 2), mainWidth, 21, 'quad');
  if (options.fill) {
    for (let attempt = 0; !main && attempt < 60; attempt++) {
      main = chip(r(13, width - mainWidth - 12), r(10, height - 31), mainWidth, 21, 'quad');
    }
  }
  const areaScale = options.fill ? height / BOARD_ROWS : 1;
  const majorCount = Math.max(3, Math.floor(width / 34 * areaScale));
  const types = [
    [23, 9, 'horizontal'], [13, 15, 'dual'], [18, 7, 'dual'],
    [26, 8, 'horizontal'], [12, 11, 'dual'], [17, 7, 'dual'],
    [18, 12, 'quad'], [10, 9, 'dual'],
  ];
  for (let i = 0; i < majorCount; i++) {
    const [w, h, type] = types[i % types.length];
    // A loose zone distribution prevents one side of the board from emptying.
    const targets = [[0.74, 36], [0.19, 18], [0.07, 10], [0.53, 47], [0.88, 18], [0.17, 45], [0.61, 12], [0.06, 42]];
    const [zone, targetY] = targets[i % targets.length];
    let placed = null;
    for (let attempt = 0; attempt < 90 && !placed; attempt++) {
      const x = attempt < 25 ? Math.floor(width * zone) + r(-5, 5) : r(13, width - w - 12);
      const y = attempt < 25 ? Math.floor(targetY * areaScale) + r(-3, 3) : r(10, height - h - 10);
      placed = chip(x, y, w, h, type);
    }
  }
  if (keepOut) {
    // Pack smaller packages into every remaining pocket, including the
    // overscan at the viewport edges and the counters inside the numerals.
    for (const [w, h, type] of [[12, 9, 'dual'], [9, 5, 'horizontal']]) {
      const sites = [];
      for (let y = 2; y < height - 2; y += 2) {
        for (let x = 4; x < width - 4; x += 2) {
          if (chipFits(x, y, w, h, type)) sites.push({ x, y, rank: random() });
        }
      }
      sites.sort((a, b) => a.rank - b.rank);
      for (const { x, y } of sites) chip(x, y, w, h, type);
    }
  }
  // Edge headers use annular pads, not electrical schematic symbols.
  for (const x of [18, width - 24]) {
    const part = { x, y: 17, w: 6, h: 27, type: 'header', pads: [] };
    if (!fits(x, part.y, part.w, part.h)) continue;
    parts.push(part);
    for (let y = part.y; y < part.y + part.h; y += 3) {
      put('components', x, y, '(o)(o)'); reserve(x, y, 6, 1);
      terminal(part, x - 1, y, 4); terminal(part, x + 6, y, 0);
    }
    captureFootprint(x, part.y, part.w, part.h - 2, 'header');
    snapshot();
  }

  // Plan related nets as a group before the passives consume their corridors.
  // A bus has shared bends and pitch; a fan-out widens adjacent package pins
  // into that pitch, then carries them together to a row of layer-change vias.
  const bundles = [];
  function polyline(points) {
    const path = [];
    for (let i = 1; i < points.length; i++) {
      const [sx, sy] = points[i - 1], [ex, ey] = points[i];
      const dx = Math.sign(ex - sx), dy = Math.sign(ey - sy);
      const steps = Math.max(Math.abs(ex - sx), Math.abs(ey - sy));
      if (dx && dy && Math.abs(ex - sx) !== Math.abs(ey - sy)) return null;
      for (let j = 0; j <= steps; j++) {
        const x = sx + dx * j, y = sy + dy * j, p = idx(x, y);
        if (!inside(x, y) || blocked[p]) return null;
        if (path.at(-1) !== p) path.push(p);
      }
    }
    return path;
  }
  function commitBundle(paths, terminals, via) {
    if (paths.length < 3 || paths.some(path => !path)) return false;
    const cells = new Set();
    for (const path of paths) {
      for (const p of path) {
        if (cells.has(p)) return false;
        cells.add(p);
      }
    }
    cells.forEach(p => { blocked[p] = 1; });
    terminals.forEach(pad => { pad.used = true; });
    bundles.push({ paths, via });
    return true;
  }
  const bank = (part, direction) => part.pads.filter(pad => pad.direction === direction && !pad.used)
    .sort((a, b) => direction % 4 === 0 ? a.y - b.y : a.x - b.x);

  // Connect facing pad banks where a clean, parallel route fits between ICs.
  const pairs = [];
  for (const a of parts) for (const b of parts) {
    if (a === b) continue;
    for (const direction of [0, 2]) {
      const from = bank(a, direction), to = bank(b, direction + 4);
      if (from.length < 3 || to.length < 3) continue;
      const horizontal = direction === 0;
      const distance = horizontal ? to[0].x - from[0].x : to[0].y - from[0].y;
      if (distance > 10 && distance < 90) pairs.push({ from, to, horizontal, distance });
    }
  }
  pairs.sort((a, b) => a.distance - b.distance);
  for (const { from, to, horizontal, distance } of pairs) {
    const aPads = from.filter(pad => !pad.used), bPads = to.filter(pad => !pad.used);
    const aPitch = aPads.length > 1 ? horizontal ? aPads[1].y - aPads[0].y : aPads[1].x - aPads[0].x : 0;
    const bPitch = bPads.length > 1 ? horizontal ? bPads[1].y - bPads[0].y : bPads[1].x - bPads[0].x : 0;
    if (!aPitch || !bPitch) continue;
    const pitch = Math.max(2, aPitch, bPitch);
    const a = aPads.filter((_, i) => i % Math.ceil(pitch / aPitch) === 0);
    const b = bPads.filter((_, i) => i % Math.ceil(pitch / bPitch) === 0);
    for (let count = Math.min(7, a.length, b.length); count >= 3; count--) {
      const aa = a.slice(0, count), bb = b.slice(0, count);
      const paths = aa.map((pad, i) => {
        const startU = horizontal ? pad.x : pad.y, startV = horizontal ? pad.y : pad.x;
        const endU = horizontal ? bb[i].x : bb[i].y, endV = horizontal ? bb[i].y : bb[i].x;
        const shift = Math.abs(endV - startV);
        if (shift + 6 > distance) return null;
        const bend = startU + Math.floor((distance - shift) / 2);
        const points = [[startU, startV], [bend, startV], [bend + shift, endV], [endU, endV]];
        return polyline(points.map(([u, v]) => horizontal ? [u, v] : [v, u]));
      });
      if (commitBundle(paths, [...aa, ...bb], false)) break;
    }
  }

  // Wider escape patterns from the remaining IC banks. Try several corridors
  // as a whole, never reroute one lane into an unrelated meander.
  for (const part of parts) {
    for (const direction of [0, 4, 6, 2]) {
      if (part !== main && random() > 0.65) continue;
      const available = bank(part, direction);
      for (let attempt = 0; attempt < 16 && available.length >= 3; attempt++) {
        const count = Math.min(attempt < 8 ? 6 : 4, available.length);
        const start = r(0, available.length - count);
        const selected = available.slice(start, start + count);
        const horizontal = direction % 4 === 0;
        const sign = direction === 0 || direction === 2 ? 1 : -1;
        const getV = pad => horizontal ? pad.y : pad.x;
        const center = Math.round((getV(selected[0]) + getV(selected.at(-1))) / 2);
        const targets = selected.map((_, i) => center + (i - Math.floor(count / 2)) * 2);
        const spread = Math.max(...selected.map((pad, i) => Math.abs(targets[i] - getV(pad))));
        const drift = r(-5, 5), lead = spread + 4;
        const length = lead + Math.abs(drift) + r(5, 13);
        const paths = selected.map((pad, i) => {
          const u = horizontal ? pad.x : pad.y, v = getV(pad), target = targets[i];
          const points = [[0, v], [2, v], [2 + Math.abs(target - v), target],
            [lead, target], [lead + Math.abs(drift), target + drift], [length, target + drift]];
          return polyline(points.map(([travel, lateral]) => horizontal ? [u + travel * sign, lateral] : [lateral, u + travel * sign]));
        });
        if (commitBundle(paths, selected, true)) break;
      }
    }
  }
  function smd(x, y, vertical, capacitor) {
    const w = vertical ? 2 : 6, h = vertical ? 4 : 2;
    if (!fits(x, y, w, h, 1)) return false;
    if (keepOut) {
      const a = vertical ? idx(x, y - 1) : idx(x - 1, y);
      const b = vertical ? idx(x, y + h) : idx(x + w, y);
      if (blocked[a] || blocked[b]) return false;
    }
    reserve(x, y, w, h);
    const part = { x, y, w, h, type: 'smd', pads: [] };
    if (vertical) {
      put('components', x, y, '##'); put('components', x, y + 1, capacitor ? '==' : '::');
      put('components', x, y + 2, capacitor ? '==' : '::'); put('components', x, y + 3, '##');
      terminal(part, x, y - 1, 6); terminal(part, x, y + 4, 2);
    } else {
      put('components', x, y, capacitor ? '##==##' : '##::##'); put('components', x, y + 1, capacitor ? '##==##' : '##::##');
      terminal(part, x - 1, y, 4); terminal(part, x + 6, y, 0);
    }
    captureFootprint(x, y, w, h, capacitor ? 'capacitor' : 'resistor');
    return true;
  }
  const anchors = parts.filter(part => part.type !== 'header');
  for (let i = 0; anchors.length && i < Math.floor(width * 0.85 * areaScale); i++) {
    const anchor = anchors[i % anchors.length];
    let best = null;
    for (let attempt = 0; attempt < 45; attempt++) {
      // Sample the IC perimeter, with a strong bias toward its nearest ring.
      // Expand locally when crowded; don't scatter leftovers across the board.
      const side = r(0, 3);
      const vertical = side >= 2;
      const w = vertical ? 2 : 6, h = vertical ? 4 : 2;
      const reach = attempt < 30 ? 9 : 17;
      const gap = 2 + Math.floor(random() ** 2 * reach);
      const x = side === 0 ? anchor.x - w - gap : side === 1 ? anchor.x + anchor.w + gap : r(anchor.x - 2, anchor.x + anchor.w);
      const y = side === 2 ? anchor.y - h - gap : side === 3 ? anchor.y + anchor.h + gap : r(anchor.y - 1, anchor.y + anchor.h);
      if (!fits(x, y, w, h, 1)) continue;
      const proximity = Math.min(...anchors.map(ic => {
        const dx = Math.max(ic.x - x - w, x - ic.x - ic.w, 0);
        const dy = Math.max(ic.y - y - h, y - ic.y - ic.h, 0);
        return Math.hypot(dx * 0.6, dy);
      }));
      const score = proximity + random() * 3;
      if (!best || score < best.score) best = { x, y, vertical, score };
    }
    if (best && smd(best.x, best.y, best.vertical, i % 3 !== 0) && i % 3 === 0) snapshot();
  }
  snapshot();

  if (keepOut) {
    // Fill the smaller gaps with complete two-terminal footprints. Keep the
    // terminals outside the lettering so every part can receive real nets.
    for (let y = 2; y < height - 2; y += 2) {
      for (let x = 4; x < width - 4; x += 2) {
        const vertical = !!(keepOut[idx(x - 2, y)] || keepOut[idx(x + 3, y)]);
        smd(x, y, vertical, random() < 0.7) || smd(x, y, !vertical, random() < 0.7);
      }
    }
    snapshot();
  }

  const free = (x, y) => inside(x, y) && !blocked[idx(x, y)];
  function route(a, b) {
    if (!free(a.x, a.y) || !free(b.x, b.y)) return null;
    const end = idx(b.x, b.y), start = idx(a.x, a.y) * 8 + a.direction;
    const distance = (x, y) => Math.max(Math.abs(x - b.x), Math.abs(y - b.y));
    const heap = new Heap(), previous = new Map(), costs = new Map([[start, 0]]);
    heap.push({ state: start, score: distance(a.x, a.y), g: 0 });
    let visits = 0;
    while (heap.items.length && visits++ < 1800) {
      const item = heap.pop();
      if (item.g !== costs.get(item.state)) continue;
      const p = Math.floor(item.state / 8), dir = item.state % 8;
      const x = p % width, y = Math.floor(p / width);
      if (p === end) {
        const path = [];
        for (let state = item.state; state !== undefined; state = previous.get(state)) path.push(Math.floor(state / 8));
        return path.reverse();
      }
      if (item.g > 65) continue;
      for (const turn of [0, -1, 1, -2, 2]) {
        const nd = (dir + turn + 8) % 8, [dx, dy] = D[nd];
        const nx = x + dx, ny = y + dy;
        if (!free(nx, ny)) continue;
        if (dx && dy && (!free(x + dx, y) || !free(x, y + dy))) continue;
        let near = 0;
        for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (layers.copper[idx(nx + ox, ny + oy)] !== ' ') near += 0.6;
        const g = item.g + (dx && dy ? 1.4 : 1) + Math.abs(turn) * 0.55 + near;
        const state = idx(nx, ny) * 8 + nd;
        if (g >= (costs.get(state) ?? Infinity)) continue;
        costs.set(state, g); previous.set(state, item.state);
        heap.push({ state, g, score: g + distance(nx, ny) });
      }
    }
    return null;
  }
  function draw(path, via = false) {
    for (let i = 0; i < path.length; i++) {
      const p = path[i], before = path[Math.max(0, i - 1)], after = path[Math.min(path.length - 1, i + 1)];
      const dx = Math.sign(after % width - before % width), dy = Math.sign(Math.floor(after / width) - Math.floor(before / width));
      layers.copper[p] = dy === 0 ? '-' : dx === 0 ? '|' : dx === dy ? '\\' : '/'; blocked[p] = 1;
    }
    if (via) layers.copper[path.at(-1)] = 'o';
  }
  for (const { paths, via } of bundles) {
    for (const path of paths) draw(path, via);
    snapshot();
  }
  // Route local connections, preserving space for the longer IC fan-outs.
  const ordered = pads.map(pad => ({ pad, rank: random() })).sort((a, b) => a.rank - b.rank).map(item => item.pad);
  let routes = 0;
  for (const a of ordered) {
    if (a.used) continue;
    const candidates = pads.filter(b => b !== a && !b.used && b.part !== a.part)
      .map(b => ({ b, d: Math.abs(a.x - b.x) + Math.abs(a.y - b.y) })).filter(item => item.d < 52)
      .sort((a, b) => a.d - b.d).slice(0, 4);
    for (const { b } of candidates) {
      const path = route(a, b);
      if (!path || path.length < 2) continue;
      draw(path); a.used = b.used = true;
      if (++routes % 3 === 0) snapshot();
      break;
    }
  }
  // Short via escapes and stitching supply the familiar fine copper texture.
  for (const pad of pads) {
    if (pad.used || random() > 0.85) continue;
    const [dx, dy] = D[pad.direction], path = [];
    const length = r(2, 6);
    for (let i = 0; i < length; i++) {
      const x = pad.x + dx * i, y = pad.y + dy * i;
      if (!free(x, y)) break;
      path.push(idx(x, y));
    }
    if (path.length >= 2) draw(path, true);
  }

  // Scatter visible tuning sections across the board, keeping straight
  // lead-ins and clearance above/below each horizontal meander.
  const meanderCandidates = [];
  const meanderTarget = Math.min(12, Math.max(4, Math.round(width / 45)));
  for (let y = 4; y < height - 4; y++) {
    const row = layers.copper.slice(y * width, (y + 1) * width).join('');
    for (const run of row.matchAll(/-{10,}/g)) {
      const length = r(4, Math.min(7, run[0].length - 4));
      const positions = run[0].length - length - 3;
      const offset = r(0, positions - 1);
      for (let attempt = 0; attempt < positions; attempt++) {
        const x = run.index + 2 + (offset + attempt) % positions;
        if (x < 12 || x + length > width - 12) continue;
        let clear = true;
        for (let dx = 0; dx < length; dx++) {
          if (blocked[idx(x + dx, y - 1)] || blocked[idx(x + dx, y + 1)]) clear = false;
        }
        if (!clear) continue;
        meanderCandidates.push({ x, y, length, rank: random() });
        break;
      }
    }
  }
  meanderCandidates.sort((a, b) => a.rank - b.rank).slice(0, meanderTarget)
    .forEach(({ x, y, length }) => put('copper', x, y, '∿'.repeat(length)));
  snapshot();
  // Fine via fences and a sparse copper fill give the spaces a board texture.
  for (let y = 5; y < height - 5; y += 4) {
    for (let x = 10; x < width - 9; x += 6) {
      let clear = true;
      for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 2; xx <= x + 2; xx++) if (blocked[idx(xx, yy)]) clear = false;
      if (clear && random() < 0.52) layers.substrate[idx(x, y)] = '.';
    }
  }
  snapshot(true);
  return frames;
}
