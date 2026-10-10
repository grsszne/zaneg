// Preserve the generator's actual package boundaries, including pins. Copper
// breaks into short connected pieces; it never becomes part of a nearby IC.
export function partitionPcb(layers, footprints = []) {
  const bodies = [];
  for (const layer of ['substrate', 'copper', 'components']) {
    const rows = (layers[layer] || '').split('\n');
    const width = rows[0].length, height = rows.length;
    const used = new Uint8Array(width * height);
    const available = (x, y) => x >= 0 && y >= 0 && x < width && y < height &&
      rows[y][x] && rows[y][x] !== ' ' && !used[y * width + x];
    const take = (cells, x, y) => {
      used[y * width + x] = 1;
      cells.push({ x, y, char: rows[y][x] });
    };
    const add = (cells, kind) => {
      if (!cells.length) return;
      const x = Math.min(...cells.map(cell => cell.x));
      const y = Math.min(...cells.map(cell => cell.y));
      const w = Math.max(...cells.map(cell => cell.x)) - x + 1;
      const h = Math.max(...cells.map(cell => cell.y)) - y + 1;
      bodies.push({ layer, kind, x, y, width: w, height: h,
        cells: cells.map(cell => ({ ...cell, x: cell.x - x, y: cell.y - y })) });
    };

    if (layer === 'components') {
      for (const footprint of footprints) {
        const cells = [];
        for (const offset of footprint.cells) {
          const x = footprint.x + offset % footprint.width;
          const y = footprint.y + Math.floor(offset / footprint.width);
          if (available(x, y)) take(cells, x, y);
        }
        add(cells, footprint.kind);
      }
    }
    // Connected-component fallback also handles a frame captured before the
    // board has finished drawing. Cap only copper, never component glyphs.
    const limit = layer === 'components' ? Infinity : layer === 'copper' ? 14 : 1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!available(x, y)) continue;
        const cells = [];
        take(cells, x, y);
        for (let i = 0; i < cells.length && cells.length < limit; i++) {
          const cell = cells[i];
          for (let dy = -1; dy <= 1 && cells.length < limit; dy++) {
            for (let dx = -1; dx <= 1 && cells.length < limit; dx++) {
              if (available(cell.x + dx, cell.y + dy)) take(cells, cell.x + dx, cell.y + dy);
            }
          }
        }
        add(cells, layer === 'components' ? 'component' : 'fragment');
      }
    }
  }
  return bodies;
}

export function createGravity(bodies, width, height, random = Math.random) {
  const binWidth = 24;
  return {
    width, height, binWidth,
    gravity: Math.max(1800, height * 3.4),
    pile: new Float32Array(Math.ceil(width / binWidth)),
    supports: Array.from({ length: Math.ceil(width / binWidth) }, () => []),
    elapsed: 0,
    active: bodies.length,
    bodies: bodies.map(body => ({
      ...body,
      vx: (random() - 0.5) * (body.layer === 'components' ? 48 : 96),
      vy: -random() * 20,
      delay: random() * 0.12,
      impacts: 0,
    })),
  };
}

export function stepGravity(world, dt, onSettle = () => {}) {
  world.elapsed += dt;
  const { bodies, pile, supports, width, height, binWidth } = world;
  for (let i = 0; i < world.active;) {
    const body = bodies[i];
    if (world.elapsed < body.delay) { i++; continue; }
    const previousBottom = body.y + body.height / 2;
    body.vy += world.gravity * dt;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
    const halfWidth = body.width / 2, halfHeight = body.height / 2;
    // Some packages start clipped by the viewport. Let them remain clipped
    // instead of snapping the entire package inward on the first frame.
    if (body.x < 0 || body.x > width) {
      body.x = Math.max(0, Math.min(width, body.x));
      body.vx *= -0.35;
    }
    const first = Math.max(0, Math.floor((body.x - halfWidth) / binWidth));
    const last = Math.min(pile.length - 1, Math.floor((body.x + halfWidth) / binWidth));
    let surface = height;
    // Keep separate landing surfaces, including the gaps beneath them. A
    // falling piece must cross a surface to land on it; pieces already below
    // a higher package can continue falling through the space underneath.
    for (let bin = first; bin <= last; bin++) {
      for (const support of supports[bin]) {
        if (previousBottom <= support.top + 0.5 && support.top < surface &&
          body.x + halfWidth > support.left && body.x - halfWidth < support.right) {
          surface = support.top;
        }
      }
    }
    const floor = surface - halfHeight;
    if (body.y >= floor && body.vy > 0) {
      body.y = floor;
      body.impacts++;
      if (body.impacts >= 2 || body.vy < 70) {
        const support = { left: body.x - halfWidth, right: body.x + halfWidth,
          top: body.y - halfHeight };
        for (let bin = first; bin <= last; bin++) {
          supports[bin].push(support);
          pile[bin] = Math.max(pile[bin], height - support.top);
        }
        onSettle(body);
        // Settled pieces are baked into a canvas; only this prefix moves.
        world.active--;
        bodies[i] = bodies[world.active];
        bodies[world.active] = body;
        continue;
      }
      body.vy = -Math.min(150, body.vy * 0.2);
      body.vx *= 0.45;
    }
    i++;
  }
}

// Every frame has exactly one character per cell. Components retain their
// local character offsets; only their origin moves, in whole grid steps.
export function stampBody(cells, body, grid) {
  const col = Math.round((body.x - body.width / 2 - grid.x) / grid.cellWidth);
  const row = Math.round((body.y - body.height / 2 - grid.y) / grid.cellHeight);
  for (const cell of body.cells) {
    const x = col + cell.x, y = row + cell.y;
    if (x >= 0 && y >= 0 && x < grid.columns && y < grid.rows) {
      cells[y * grid.columns + x] = cell.glyph;
    }
  }
}

export function collapsePcb(element, canvas, onComplete, footprints) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const context = canvas.getContext('2d');
  if (motion.matches || !context) { onComplete(); return () => {}; }

  const bounds = element.getBoundingClientRect();
  const width = bounds.width, height = bounds.height;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.ceil(width * ratio);
  canvas.height = Math.ceil(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const layers = {}, styles = {};
  const names = ['substrate', 'copper', 'components'];
  [...element.querySelectorAll('pre')].forEach((pre, i) => {
    const style = getComputedStyle(pre), box = pre.getBoundingClientRect();
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.font = font;
    const metrics = context.measureText('Mg');
    const cellWidth = context.measureText('M').width;
    const cellHeight = parseFloat(style.lineHeight);
    const fontSize = parseFloat(style.fontSize);
    const ascent = metrics.fontBoundingBoxAscent ?? fontSize * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? fontSize * 0.2;
    layers[names[i]] = pre.textContent;
    styles[names[i]] = { font, color: style.color, cellWidth, cellHeight,
      baseline: (cellHeight - ascent - descent) / 2 + ascent,
      x: box.left - bounds.left, y: box.top - bounds.top };
  });
  const rows = layers.components.split('\n');
  const grid = { ...styles.components, columns: rows[0].length, rows: rows.length };
  const glyphs = [null], glyphMap = new Map();
  const bodies = partitionPcb(layers, footprints).map(body => {
    const style = styles[body.layer];
    return { ...body,
      x: style.x + (body.x + body.width / 2) * style.cellWidth,
      y: style.y + (body.y + body.height / 2) * style.cellHeight,
      width: body.width * style.cellWidth, height: body.height * style.cellHeight,
      cells: body.cells.map(cell => {
        const key = `${body.layer}:${cell.char}`;
        if (!glyphMap.has(key)) {
          glyphMap.set(key, glyphs.length);
          glyphs.push({ char: cell.char, ...style, sprites: [] });
        }
        return { ...cell, glyph: glyphMap.get(key) };
      }),
    };
  }).filter(body => body.x + body.width / 2 > 0 && body.x - body.width / 2 < width &&
    body.y + body.height / 2 > 0 && body.y - body.height / 2 < height);
  if (!bodies.length) { onComplete(); return () => {}; }

  // Cache runs of 1, 2, 4, 8, 16 and 32 identical characters. Dense IC interiors
  // and straight traces then need only a few draws, without rotating sprites
  // or drawing multiple glyphs over the same grid cell.
  const padding = 2, counts = [1, 2, 4, 8, 16, 32];
  const spriteHeight = Math.ceil((grid.cellHeight + padding * 2) * ratio);
  const widths = counts.map(count => Math.ceil((grid.cellWidth * count + padding * 2) * ratio));
  const atlas = document.createElement('canvas');
  atlas.width = widths.reduce((sum, value) => sum + value, 0);
  atlas.height = (glyphs.length - 1) * spriteHeight;
  const atlasContext = atlas.getContext('2d');
  if (!atlasContext) { onComplete(); return () => {}; }
  atlasContext.scale(ratio, ratio);
  for (let index = 1; index < glyphs.length; index++) {
    const glyph = glyphs[index];
    let x = 0;
    atlasContext.font = glyph.font;
    atlasContext.fillStyle = glyph.color;
    counts.forEach((count, i) => {
      const y = (index - 1) * spriteHeight;
      glyph.sprites.push({ x, y, width: widths[i], height: spriteHeight });
      atlasContext.fillText(glyph.char.repeat(count), x / ratio + padding,
        y / ratio + padding + glyph.baseline);
      x += widths[i];
    });
  }

  const world = createGravity(bodies, width, height);
  const settled = new Uint16Array(grid.columns * grid.rows);
  const frame = new Uint16Array(settled.length);
  const paint = () => {
    frame.set(settled);
    for (let i = 0; i < world.active; i++) stampBody(frame, world.bodies[i], grid);
    context.clearRect(0, 0, width, height);
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.columns;) {
        const glyph = frame[row * grid.columns + col];
        if (!glyph) { col++; continue; }
        let end = col + 1;
        while (end < grid.columns && frame[row * grid.columns + end] === glyph) end++;
        while (col < end) {
          const run = Math.min(5, Math.floor(Math.log2(end - col)));
          const sprite = glyphs[glyph].sprites[run];
          context.drawImage(atlas, sprite.x, sprite.y, sprite.width, sprite.height,
            grid.x + col * grid.cellWidth - padding, grid.y + row * grid.cellHeight - padding,
            sprite.width / ratio, sprite.height / ratio);
          col += counts[run];
        }
      }
    }
  };
  paint();

  let animation, deadline, settledAt;
  let stopped = false;
  let previous = performance.now();
  const stop = () => {
    stopped = true;
    cancelAnimationFrame(animation);
    clearTimeout(deadline);
    motion.removeEventListener('change', finish);
    window.removeEventListener('resize', finish);
  };
  const finish = () => {
    if (stopped) return;
    stop();
    onComplete();
  };
  const step = now => {
    if (stopped) return;
    // Small substeps keep the bounce stable through an occasional slow frame.
    let remaining = Math.min((now - previous) / 1000, 0.1);
    previous = now;
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 120);
      stepGravity(world, dt, body => stampBody(settled, body, grid));
      remaining -= dt;
    }
    paint();
    if (world.active === 0) {
      settledAt ??= now;
      if (now - settledAt > 350) { finish(); return; }
    }
    animation = requestAnimationFrame(step);
  };
  // Navigation still completes if the tab is backgrounded during the fall.
  deadline = setTimeout(finish, 2600);
  motion.addEventListener('change', finish);
  window.addEventListener('resize', finish);
  animation = requestAnimationFrame(step);
  return stop;
}
