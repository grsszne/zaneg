// Educational first-order current response and piecewise-linear lasing threshold.
// Currents are normalized to Ith; these are not TX-A component parameters.
export function modelLaserDrive({ bits, rate, bias, modulation, tau }) {
  const bitNs = 1000 / rate;
  const decay = Math.exp(-bitNs / tau);
  let current = bias;
  // Settle the repeated pattern before capturing a window.
  for (let cycle = 0; cycle < 32; cycle++) {
    for (const bit of bits) {
      const target = bias + modulation * bit;
      current = target + (current - target) * decay;
    }
  }
  const samples = [];
  for (let i = 0; i < bits.length; i++) {
    const target = bias + modulation * bits[i];
    const start = current;
    for (let step = 0; step < 64; step++) {
      const value = target + (start - target) * Math.exp(-step / 64 * bitNs / tau);
      samples.push({ time: i + step / 64, current: value, light: Math.max(0, value - 1) });
    }
    current = target + (start - target) * decay;
  }
  samples.push({ time: bits.length, current, light: Math.max(0, current - 1) });
  return { samples, bitNs };
}
