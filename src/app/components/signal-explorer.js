"use client";

import { useEffect, useId, useState } from "react";
import styles from "./signal-explorer.module.css";
import { modelLaserDrive } from "@/app/lib/laser-drive";

const BITS = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0];
const WIDTH = 640;
const bitAt = (t) => BITS[((Math.floor(t) % BITS.length) + BITS.length) % BITS.length];

function digitalPath(cells, phase = 0, clock = false) {
  const value = (t) => clock ? (t - Math.floor(t) < .5 ? 1 : 0) : bitAt(t);
  let path = `M0 ${value(phase) ? 12 : 50}`;
  const step = clock ? .5 : 1;
  for (let t = (Math.floor(phase / step) + 1) * step; t < cells + phase; t += step) {
    path += `H${((t - phase) / cells * WIDTH).toFixed(2)}V${value(t + .00001) ? 12 : 50}`;
  }
  return `${path}H${WIDTH}`;
}

function analogPath(stage) {
  let smooth = BITS[0];
  return Array.from({ length: 801 }, (_, i) => {
    const t = i / 800 * 16;
    smooth += (bitAt(t) - smooth) * .3;
    const noise = .045 * Math.sin(i * 1.7) + .025 * Math.sin(i * .53);
    const value = stage === 0 ? .18 + .57 * smooth + noise : .12 + .76 * smooth + noise * 1.3;
    return `${i ? "L" : "M"}${(i / 800 * WIDTH).toFixed(1)} ${(52 - value * 42).toFixed(1)}`;
  }).join(" ");
}

function Trace({ label, path, accent = false, dim = false, differential = false, markers = [], sweep = false, scale }) {
  return <div className={`${styles.trace} ${dim ? styles.dim : ""}`}>
    <span className={styles.traceLabel}>{label}{scale && <small className={styles.traceScale}>{scale}</small>}</span>
    <svg viewBox="0 0 640 64" preserveAspectRatio="none" role="img" aria-label={label}>
      {[0, 160, 320, 480, 640].map(x => <path key={x} d={`M${x} 0V64`} className={styles.grid} />)}
      <path d="M0 50H640" className={styles.grid} />
      {markers.map((x, i) => <path key={i} d={`M${x} 3V60`} className={styles.marker} />)}
      <path d={path} className={differential ? styles.positive : accent ? styles.optical : styles.signal} />
      {differential && <path d={path} transform="translate(0 62) scale(1 -1)" className={styles.negative} />}
      {sweep && <path d="M0 0V64" className={styles.sweep} />}
    </svg>
  </div>;
}

const DRIVE_PRESETS = [
  { name: "Baseline", rate: 5, bias: .7, modulation: .8, tau: 8 },
  { name: "Below threshold", rate: 5, bias: .2, modulation: .6, tau: 8 },
  { name: "Slow driver", rate: 50, bias: .7, modulation: .8, tau: 40 },
  { name: "High bias", rate: 5, bias: 1.2, modulation: .8, tau: 8 },
];

function TxExplorer() {
  const id = useId();
  const [drive, setDrive] = useState(DRIVE_PRESETS[0]);
  const { rate, bias, modulation, tau } = drive;
  const { samples, bitNs } = modelLaserDrive({ bits: BITS, ...drive });
  const currentScale = Math.max(1.6, bias + modulation + .1);
  const lightScale = Math.max(.6, bias + modulation - .9);
  const set = (key, value) => setDrive(previous => ({ ...previous, [key]: value }));
  const pathFor = (key, max) => samples.map((point, i) => `${i ? "L" : "M"}${(point.time / 16 * 640).toFixed(2)} ${(54 - point[key] / max * 48).toFixed(2)}`).join(" ");
  const rateLabel = rate < 1 ? `${Math.round(rate * 1000)} kbit/s` : `${Number(rate.toFixed(1))} Mbit/s`;
  const controls = [
    { key: "rate", label: "Data rate", value: Math.round(Math.log(rate / .1) / Math.log(500) * 1000), max: 1000, step: 1, output: rateLabel, convert: value => .1 * 500 ** (value / 1000) },
    { key: "bias", label: "Bias current", value: bias, max: 1.3, step: .01, output: `${bias.toFixed(2)} × Ith` },
    { key: "modulation", label: "Modulation current", value: modulation, max: 1.5, step: .01, output: `${modulation.toFixed(2)} × Ith` },
    { key: "tau", label: "Driver response (τ)", value: tau, min: 1, max: 100, step: 1, output: `${tau} ns` },
  ];
  const observation = bias + modulation <= 1 ? "Drive current stays below the lasing threshold."
    : bias >= 1 ? "The laser keeps emitting during zero bits."
    : tau / bitNs > .4 ? "Short pulses merge before the driver reaches its set current."
    : "Zero bits sit below threshold; one bits cross it.";
  const eyes = Array.from({length: 14}, (_, window) => samples.slice(window * 64 + 32, window * 64 + 161).map((point, i) => `${i ? "L" : "M"}${i / 128 * 320} ${(94 - point.light / lightScale * 80).toFixed(2)}`).join(" "));

  return <>
    <div className={styles.presets} aria-label="Laser drive examples">
      {DRIVE_PRESETS.map(preset => <button key={preset.name} type="button" aria-pressed={["rate", "bias", "modulation", "tau"].every(key => drive[key] === preset[key])} onClick={() => setDrive(preset)}>{preset.name}</button>)}
    </div>
    <div className={styles.driveControls}>
      {controls.map(control => <div key={control.key} className={styles.slider}>
        <label htmlFor={`${id}-${control.key}`}>{control.label}<output>{control.output}</output></label>
        <input id={`${id}-${control.key}`} type="range" min={control.min ?? 0} max={control.max} step={control.step} value={control.value} aria-valuetext={control.output} onChange={event => set(control.key, control.convert ? control.convert(Number(event.target.value)) : Number(event.target.value))} />
      </div>)}
    </div>
    <Trace label="Data" path={digitalPath(16)} />
    <div className={styles.trace}>
      <span className={styles.traceLabel}>Diode current<small className={styles.traceScale}>0–{currentScale.toFixed(1)} × Ith</small></span>
      <svg viewBox="0 0 640 64" preserveAspectRatio="none" role="img" aria-label="Diode current relative to the lasing threshold">
        <path d="M0 54H640" className={styles.grid} />
        <path d={`M0 ${54 - 48 / currentScale}H640`} className={styles.threshold} />
        <path d={pathFor("current", currentScale)} className={styles.signal} />
        <text x="636" y={50 - 48 / currentScale} textAnchor="end" className={styles.thresholdLabel}>Ith</text>
      </svg>
    </div>
    <Trace label="Laser output" path={pathFor("light", lightScale)} accent scale={`0–${lightScale.toFixed(1)} relative`} />
    <div className={styles.axis}><span>0</span><span>{(bitNs * 16 / 1000).toFixed(2)} µs · 16 bits</span></div>
    <div className={styles.eyeLayout}>
      <div>
        <h6>Optical eye</h6>
        <p className={styles.caption}>The same output, overlaid in two-bit windows.</p>
        <p className={styles.driveObservation} role="status">{observation}</p>
      </div>
      <svg viewBox="0 0 320 110" role="img" aria-label="Optical eye diagram: overlaid pulses reveal the separation between high and low light levels">
        <path d="M0 94H320M160 4V102" className={styles.grid} />
        {eyes.map((path, i) => <path key={i} d={path} className={styles.eyeTrace} />)}
      </svg>
    </div>
    <p className={styles.caption}>First-order model · Ith = lasing threshold · Vertical scales follow the set current</p>
    <p className={styles.sources}><a href="https://www.analog.com/en/resources/technical-articles/interfacing-digitally-controlled-potentiometers-and-resistors-to-laser-drivers.html" target="_blank" rel="noreferrer">Bias and modulation reference ↗</a></p>
  </>;
}

const RX = [
  { name: "Photodiode", part: "S5972", label: "Photocurrent", description: "S5972 photocurrent, with noise." },
  { name: "TIA", part: "AD8015", label: "TIA · analog", description: "AD8015 converts photocurrent to differential voltage. P and N move in opposite directions." },
  { name: "Digital output", part: "SY88803V · Post amp", label: "Post amp · digital", description: "The limiting amplifier produces complementary digital outputs. P high / N low represents 1; P low / N high represents 0." },
];

function RxExplorer() {
  const [selected, setSelected] = useState(0);
  return <>
    <div className={styles.chain} aria-label="Receiver stages">
      {RX.map((stage, i) => <button type="button" key={stage.name} aria-pressed={selected === i} onClick={() => setSelected(i)}><span>{stage.name}</span><small>{stage.part}</small></button>)}
    </div>
    <div className={styles.pairLegend} aria-label="Differential traces"><span className={styles.positiveKey}>P</span><span className={styles.negativeKey}>N</span></div>
    {RX.map((stage, i) => <Trace key={stage.name} label={stage.label} path={i < 2 ? analogPath(i) : digitalPath(16)} differential={i > 0} dim={i !== selected} />)}
    <p className={styles.outputLabel}>Digital P / N → clock recovery</p>
    <p className={styles.description} aria-live="polite">{RX[selected].description}</p>
    <p className={styles.caption}>Relative levels · P / N shown about a common midpoint</p>
    <p className={styles.sources}><a href="https://www.analog.com/en/products/ad8015.html" target="_blank" rel="noreferrer">AD8015 reference ↗</a><a href="https://ww1.microchip.com/downloads/en/DeviceDoc/sy88803v.pdf" target="_blank" rel="noreferrer">SY88803V reference ↗</a></p>
  </>;
}

function CdrExplorer() {
  const id = useId();
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      setRunning(false);
      return;
    }
    let frame;
    const start = performance.now();
    const from = progress;
    const tick = (now) => {
      const next = Math.min(from + (now - start) / 3200, 1);
      setProgress(next);
      if (next < 1) frame = requestAnimationFrame(tick);
      else setRunning(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Capture the current position when playback starts; scrubbing stops playback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const bits = BITS.slice(0, 8);
  const x = t => 16 + t * 76;
  const edgeTimes = bits.map((_, i) => i === 0 ? 0 : i + Math.sin(i * 2.7) * .045);
  const readAt = time => {
    let index = 0;
    while (index + 1 < bits.length && time >= edgeTimes[index + 1]) index++;
    return bits[index];
  };
  // A clock with both phase and frequency offset converges to one sample per bit.
  const samples = bits.map((expected, i) => {
    const time = i + .5 + (.6 - .18 * i) * (1 - progress);
    return { x: x(time), value: readAt(time), expected };
  });
  const errors = samples.filter(sample => sample.value !== sample.expected).length;
  let incoming = `M0 ${bits[0] ? 12 : 50}`;
  for (let i = 1; i < bits.length; i++) incoming += `H${x(edgeTimes[i])}V${bits[i] ? 12 : 50}`;
  incoming += "H640";
  let clockPath = "M0 50";
  const halfPeriod = 76 * (1 - .18 * (1 - progress)) / 2;
  samples.forEach(sample => { clockPath += `H${sample.x}V12H${sample.x + halfPeriod}V50`; });
  clockPath += "H640";

  return <>
    <div className={styles.controls}>
      <button type="button" onClick={() => {
        if (running) setRunning(false);
        else { if (progress === 1) setProgress(0); setRunning(true); }
      }}>{running ? "Pause" : progress === 1 ? "Replay" : "Recover clock"}</button>
      <button type="button" onClick={() => { setRunning(false); setProgress(0); }}>Reset</button>
      <span role="status">{progress === 1 ? "Aligned · 8 / 8 bits match" : `${8 - errors} / 8 bits match`}</span>
    </div>
    <div className={styles.bitRow}>
      <span className={styles.traceLabel}>Sent bits</span>
      <div className={styles.byte} aria-label={`Sent bits: ${bits.join("")}`}>
        {bits.map((bit, i) => <span key={i}>{bit}</span>)}
      </div>
    </div>
    <div className={styles.trace}>
      <span className={styles.traceLabel}>Incoming signal</span>
      <svg viewBox="0 0 640 64" preserveAspectRatio="none" role="img" aria-label="Sampling dots on the incoming signal; plum dots read the wrong bit">
        {bits.map((_, i) => <path key={i} d={`M${x(i)} 0V64`} className={styles.grid} />)}
        <path d={incoming} className={styles.signal} />
        {samples.map((sample, i) => <g key={i} className={sample.value !== sample.expected ? styles.wrongSample : styles.sample}>
          <path d={`M${sample.x} 0V64`} className={styles.sampleGuide} />
          <circle cx={sample.x} cy={sample.value ? 12 : 50} r="4" />
        </g>)}
      </svg>
    </div>
    <div className={styles.trace}>
      <span className={styles.traceLabel}>Sampling clock</span>
      <svg viewBox="0 0 640 64" preserveAspectRatio="none" role="img" aria-label="Each rising clock edge reads one bit from the incoming signal">
        <path d={clockPath} className={styles.signal} />
        {samples.map((sample, i) => <g key={i} className={sample.value !== sample.expected ? styles.wrongSample : styles.sample}>
          <path d={`M${sample.x} 0V64`} className={styles.sampleGuide} />
          <path d={`M${sample.x - 4} 28L${sample.x} 22L${sample.x + 4} 28`} className={styles.sampleArrow} />
        </g>)}
      </svg>
    </div>
    <div className={styles.bitRow}>
      <span className={styles.traceLabel}>Read bits</span>
      <div className={styles.byte} aria-label={`Read bits: ${samples.map(sample => sample.value).join("")}`}>
        {samples.map((sample, i) => <span key={i} className={sample.value !== sample.expected ? styles.wrongBit : styles.readBit} aria-label={`Bit ${i + 1}: read ${sample.value}, expected ${sample.expected}`}>
          {sample.value}<small>{sample.value !== sample.expected ? "×" : "✓"}</small>
        </span>)}
      </div>
    </div>
    <div className={`${styles.slider} ${styles.recoverySlider}`}>
      <label htmlFor={id}>Clock alignment<output>{Math.round(progress * 100)}%</output></label>
      <input id={id} type="range" min="0" max="100" step="1" value={Math.round(progress * 100)} onChange={event => { setRunning(false); setProgress(Number(event.target.value) / 100); }} />
      <div className={styles.extents}><span>Offset</span><span>Centered</span></div>
    </div>
    <p>Each rising clock edge reads the signal at a dot. Plum marks a wrong bit. Recovery moves those reads toward the bit centers.</p>
    <p className={styles.caption}>Same incoming signal · Timing correction only</p>
  </>;
}

export default function SignalExplorer({ kind }) {
  return <section className={styles.explorer} aria-label={kind === "tx" ? "TX waveform explorer" : kind === "rx" ? "RX signal-chain explorer" : "Clock recovery explorer"}>
    <div className={styles.heading}><h5>{kind === "tx" ? "Laser drive" : kind === "rx" ? "RX signal chain" : "Clock recovery"}</h5><span>Illustration</span></div>
    {kind === "tx" ? <TxExplorer /> : kind === "rx" ? <RxExplorer /> : <CdrExplorer />}
  </section>;
}
