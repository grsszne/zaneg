// A small, deliberately uncoded payload model for the article illustration.
export function toBits(bytes) {
  return Array.from(bytes).flatMap((byte) =>
    Array.from({ length: 8 }, (_, bit) => (byte >> (7 - bit)) & 1),
  );
}

export function toBytes(bits) {
  return Uint8Array.from(
    Array.from({ length: Math.floor(bits.length / 8) }, (_, byte) =>
      bits.slice(byte * 8, byte * 8 + 8).reduce((value, bit) => (value << 1) | bit, 0),
    ),
  );
}

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function readableBytes(bits) {
  return new TextDecoder().decode(toBytes(bits), { stream: true })
    .replace(/[\u0000-\u001f\u007f]/g, '·');
}

// Relative voltage for the illustration, not a circuit model of the AD8015.
// Keep noise tied to sample position so pausing and inspecting never changes it.
export function tiaVoltageSamples(bits, start = 0, count = 32) {
  const samplesPerBit = 24;
  const warmup = Math.max(0, start - 2);
  const end = Math.min(bits.length, start + count);
  let voltage = warmup > 0 ? bits[warmup - 1] : 0;
  const samples = [];

  for (let bit = warmup; bit < end; bit++) {
    for (let step = 0; step < samplesPerBit; step++) {
      voltage += (bits[bit] - voltage) * 0.35;
      if (bit < start) continue;
      const sample = bit * samplesPerBit + step;
      const noise = Math.sin(sample * 1.73) * 0.025 + Math.sin(sample * 0.61 + 1.1) * 0.018;
      samples.push({ position: bit - start + step / samplesPerBit, voltage: voltage + noise });
    }
  }

  return samples;
}
