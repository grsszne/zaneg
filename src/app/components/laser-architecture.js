"use client";

import { useEffect, useRef, useState } from "react";
import { crc32, readableBytes, tiaVoltageSamples, toBits, toBytes } from "@/app/lib/laser-link";
import styles from "./laser-architecture.module.css";
import { Pi5Board, UsbInterfaceBoard, OpticalBoard } from "./laser-board-drawings";

const BIT_MS = 65;
const FLIGHT = 6;
const RETURN_MS = 900;
const idle = { phase: "idle", bits: [], received: [], tick: 0, paused: false, returnProgress: 0 };
const parts = {
  host: { label: "Raspberry Pi", text: "Each node uses a Raspberry Pi 5 with the Active Cooler. It runs the host software and sends and receives payloads over USB." },
  usb: { label: "USB interface", text: "An STM32F723 moves data between USB and the optical hardware. It buffers outgoing data for TX-A and accepts recovered bytes from RX-A." },
  tx: { label: "TX-A", text: "TX-A drives an HL63603TG diode at 638 nm. Modulating the laser current converts electrical bits into optical pulses." },
  rx: { label: "RX-A", text: "A lens focuses light onto an S5972 photodiode. The AD8015 converts its current into a voltage; the SY88803V limits that signal. An iCE40UP5K FPGA is intended to recover timing and decode the bits." },
};

function finishRun(run) {
  const sourceCRC = crc32(run.bytes);
  const receivedCRC = crc32(toBytes(run.samples));
  return { sourceCRC, receivedCRC, good: sourceCRC === receivedCRC };
}

function OpticalAssembly({ receiver, y, reverse, selected, choose }) {
  const model = receiver ? "rx-a" : "tx-a";
  const terminalY = y + (reverse ? 8 : -8);
  return <g className={selected ? styles.selectedPart : ""} onClick={choose}>
    <OpticalBoard model={model} x={receiver ? 222 : 240} y={y - 32} reverse={reverse} />
    {receiver ? <>
      {/* A lens is shown separately from the board-mounted S5972. */}
      <path d={`M340 ${y - 18}q-9 18 0 36q9-18 0-36z`} className={styles.lens} />
      <path d={`M336 ${y - 13}L315 ${y}l21 13`} className={styles.focusCone} />
    </> : <>
      {/* The external laser connects to TX-A's two-way screw terminal. */}
      <path d={`M300 ${terminalY}H316V${y - 1.5}h11 M300 ${terminalY + 3}H312V${y + 1.5}h15`} className={styles.wiring} />
      <rect x="327" y={y - 9} width="20" height="18" rx="2" className={styles.pcbMetal} />
      <path d={`M331 ${y - 9}v18 M343 ${y - 9}v18`} className={styles.pcbDetail} />
      <ellipse cx="348" cy={y} rx="3" ry="6" className={styles.lens} />
    </>}
  </g>;
}

function Station({ reverse, part, choose }) {
  const upperPart = reverse ? "rx" : "tx";
  const lowerPart = reverse ? "tx" : "rx";
  return (
    <g transform={reverse ? "translate(1000 0) scale(-1 1)" : undefined} className={styles.station}>
      {/* Separate schematic routes: host USB, transmit data, recovered data.
          The routes describe connectivity, not a physical cable harness. */}
      <path d="M110 151V200 M106 160l4-4 4 4 M106 191l4 4 4-4" className={`${styles.wiring} ${part === "host" || part === "usb" ? styles.activeWire : ""}`} />
      <path d={`M159 219h23q8 0 8-8v-83q0-8 8-8h${reverse ? 24 : 42}`} className={`${styles.wiring} ${part === upperPart || part === "usb" ? styles.activeWire : ""}`} />
      <path d={`M${reverse ? 240 : 222} 287h${reverse ? -42 : -24}q-8 0-8-8v-23q0-8-8-8h-23`} className={`${styles.wiring} ${part === lowerPart || part === "usb" ? styles.activeWire : ""}`} />
      <path d={reverse ? "M163 215l-4 4 4 4 M236 283l4 4-4 4" : "M236 116l4 4-4 4 M163 244l-4 4 4 4"} className={styles.wiring} />
      <g className={part === "host" ? styles.selectedPart : ""} onClick={() => choose("host")}><Pi5Board x={50} y={70} reverse={reverse} /></g>
      <g className={part === "usb" ? styles.selectedPart : ""} onClick={() => choose("usb")}><UsbInterfaceBoard x={58} y={200} reverse={reverse} /></g>
      <OpticalAssembly y={120} receiver={reverse} reverse={reverse} selected={part === (reverse ? "rx" : "tx")} choose={() => choose(reverse ? "rx" : "tx")} />
      <OpticalAssembly y={287} receiver={!reverse} reverse={reverse} selected={part === (reverse ? "tx" : "rx")} choose={() => choose(reverse ? "tx" : "rx")} />
    </g>
  );
}

function Illustration({ view, blocked, toggleBlock, part, choose }) {
  const sending = view.phase === "sending";
  const returning = view.phase === "ack" || view.phase === "nack";
  const sourceOn = sending && view.bits[Math.floor(view.tick)] === 1;
  const pulses = [];
  for (let index = Math.max(0, Math.ceil(view.tick - FLIGHT)); index <= Math.min(view.bits.length - 1, Math.floor(view.tick)); index++) {
    const progress = (view.tick - index) / FLIGHT;
    if (view.bits[index] && !(progress >= 0.5 && view.samples?.[index] === 0)) {
      pulses.push({ index, x: 356 + progress * 288 });
    }
  }
  return (
    <svg viewBox="0 0 1000 355" className={styles.illustration} aria-hidden="true" focusable="false">
      <Station part={part} choose={choose} />
      <Station reverse part={part} choose={choose} />
      <g className={styles.hardwareLabels}>
        <text x="108" y="50" textAnchor="middle">Pi 5</text>
        <text x="892" y="50" textAnchor="middle">Pi 5</text>
        <text x="108" y="285" textAnchor="middle">USB interface</text>
        <text x="892" y="285" textAnchor="middle">USB interface</text>
        <text x="274" y="68" textAnchor="middle">TX-A</text>
        <text x="728" y="68" textAnchor="middle">RX-A</text>
        <text x="272" y="235" textAnchor="middle">RX-A</text>
        <text x="726" y="235" textAnchor="middle">TX-A</text>
        <text x="123" y="180">USB</text>
        <text x="877" y="180" textAnchor="end">USB</text>
      </g>
      <path d="M356 120H644" className={styles.beamGuide} />
      <path d="M356 287H644" className={styles.returnGuide} />
      {sourceOn && <circle cx="352" cy="120" r="5" className={styles.emitter} />}
      {sending && pulses.map((pulse) => <path key={pulse.index} d={`M${pulse.x - 5} 120h10`} className={styles.pulse} />)}
      {returning && <g transform={`translate(${644 - 288 * view.returnProgress} 287)`}><circle r="4" className={styles.emitter} /><text y="-18" textAnchor="middle" className={styles.ackLabel}>{view.good ? "ACK" : "NACK"}</text></g>}
      <text x="500" y="204" textAnchor="middle" className={styles.spaceLabel}>{blocked ? "beam blocked" : "638 nm"}</text>
      <text x="500" y="320" textAnchor="middle" className={styles.returnLabel}>return channel ←</text>
      <g onClick={toggleBlock} className={styles.shutter} style={{ transform: `translateY(${blocked ? 0 : -70}px)` }}>
        <path d="M492 97l16-6v58l-16 6z" />
        <path d="M492 97v58" className={styles.shutterEdge} />
      </g>
    </svg>
  );
}

function Trace({ bits, start, cursor, received = false, analog = false }) {
  const count = 32;
  const height = analog ? 56 : 40;
  const baseline = analog ? 43 : 29;
  let path = "";
  if (analog) {
    path = tiaVoltageSamples(bits, start, count).map(({ position, voltage }, index) =>
      `${index === 0 ? "M" : "L"}${(position * 20).toFixed(2)} ${(baseline - voltage * 30).toFixed(2)}`
    ).join(" ");
  } else {
    bits.slice(start, start + count).forEach((bit, index) => {
      const x = index * 20;
      const y = bit ? 9 : baseline;
      path += index === 0 ? `M${x} ${y}` : `V${y}`;
      path += `H${x + 20}`;
    });
  }
  return (
    <svg viewBox={`0 0 640 ${height}`} preserveAspectRatio="none" className={`${styles.trace} ${analog ? styles.voltageTrace : ""}`} aria-hidden="true">
      <path d={`M0 ${baseline}H640`} className={styles.traceBaseline} />
      {[0, 8, 16, 24, 32].map((i) => <path key={i} d={`M${i * 20} 2v${height - 4}`} className={styles.traceGrid} />)}
      <path d={path} className={analog ? styles.analogTrace : received ? styles.receivedTrace : styles.sentTrace} />
      {bits.length > 0 && <path d={`M${(cursor - start) * 20 + 10} 1v${height - 2}`} className={styles.cursor} />}
    </svg>
  );
}

export default function LaserArchitecture() {
  const [message, setMessage] = useState("Hello world");
  const [view, setView] = useState(idle);
  const [blocked, setBlocked] = useState(false);
  const [part, setPart] = useState(null);
  const [inspector, setInspector] = useState(null);
  const runRef = useRef(null);
  const frameRef = useRef(null);
  const loopRef = useRef(null);
  const blockedRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updateMotion() {
      reducedRef.current = media.matches;
      const run = runRef.current;
      if (media.matches && run && !run.finished) {
        cancelAnimationFrame(frameRef.current);
        run.samples = run.bits.map((bit, index) => run.samples[index] ?? (blockedRef.current ? 0 : bit));
        run.finished = true;
        setView({ ...run, phase: "done", received: run.samples, tick: run.bits.length + FLIGHT, paused: false, ...finishRun(run) });
      }
    }
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => {
      cancelAnimationFrame(frameRef.current);
      media.removeEventListener("change", updateMotion);
    };
  }, []);

  function toggleBlock() {
    blockedRef.current = !blockedRef.current;
    setBlocked(blockedRef.current);
  }

  function send(event) {
    event.preventDefault();
    if (!message.trim()) return;
    cancelAnimationFrame(frameRef.current);
    setInspector(null);
    const bytes = new TextEncoder().encode(message);
    const bits = toBits(bytes);
    const bitMs = Math.min(BIT_MS, 8000 / bits.length);
    const run = { bytes, bits, samples: Array(bits.length).fill(null), sampled: 0, elapsed: 0, last: null, paused: false, finished: false };
    runRef.current = run;
    if (reducedRef.current) {
      run.samples = bits.map(bit => blockedRef.current ? 0 : bit);
      run.finished = true;
      setView({ ...run, phase: "done", received: run.samples, tick: bits.length + FLIGHT, ...finishRun(run) });
      return;
    }
    function paint(now) {
      if (run.paused || run.finished) return;
      if (run.last !== null) run.elapsed += Math.min(now - run.last, 80);
      run.last = now;
      const tick = run.elapsed / bitMs;
      const crossed = Math.min(bits.length, Math.max(0, Math.floor(tick - FLIGHT / 2) + 1));
      while (run.sampled < crossed) {
        run.samples[run.sampled] = blockedRef.current ? 0 : bits[run.sampled];
        run.sampled++;
      }
      const arrived = Math.min(bits.length, Math.max(0, Math.floor(tick - FLIGHT) + 1));
      const returnProgress = Math.max(0, (run.elapsed - (bits.length + FLIGHT) * bitMs) / RETURN_MS);
      const result = arrived === bits.length ? (run.result ??= finishRun(run)) : {};
      const phase = returnProgress >= 1 ? "done" : tick >= bits.length + FLIGHT ? (result.good ? "ack" : "nack") : "sending";
      setView({ bits, bytes, samples: [...run.samples], received: run.samples.slice(0, arrived), tick, phase, paused: false, returnProgress, ...result });
      if (phase === "done") run.finished = true;
      else frameRef.current = requestAnimationFrame(paint);
    }
    loopRef.current = paint;
    frameRef.current = requestAnimationFrame(paint);
  }

  function togglePause() {
    const run = runRef.current;
    if (!run || run.finished) return;
    run.paused = !run.paused;
    setView(current => ({ ...current, paused: run.paused }));
    if (run.paused) cancelAnimationFrame(frameRef.current);
    else {
      run.last = null;
      setInspector(null);
      frameRef.current = requestAnimationFrame(loopRef.current);
    }
  }

  function reset() {
    cancelAnimationFrame(frameRef.current);
    runRef.current = null;
    setInspector(null);
    setView(idle);
  }

  const active = view.phase !== "idle" && view.phase !== "done";
  const firstError = view.phase === "done" && !view.good
    ? view.bits.findIndex((bit, index) => bit !== view.received[index]) : -1;
  const cursor = inspector ?? (firstError >= 0 ? firstError : Math.max(0, Math.min(view.bits.length - 1, Math.floor(view.tick - FLIGHT))));
  const start = Math.max(0, Math.min(Math.max(0, view.bits.length - 32), Math.floor(cursor / 8) * 8 - 8));
  const displayedBits = view.phase === "idle" ? toBits(new TextEncoder().encode(message)) : view.bits;
  const output = readableBytes(view.received);
  const status = view.phase === "idle" ? "" : view.paused ? "Paused" : view.phase === "done" ? (view.good ? "Received · CRC32 match" : "Rejected · CRC32 mismatch") : view.phase === "ack" ? "Acknowledging receipt" : view.phase === "nack" ? "Requesting retransmission" : "Transmitting";

  return (
    <section className={styles.experiment} aria-label="Interactive optical link illustration">
      <h2>Link simulation</h2>
      <form onSubmit={send} className={styles.form}>
        <label htmlFor="laser-message">Message</label>
        <div className={styles.messageRow}>
          <input id="laser-message" value={message} onChange={event => setMessage(event.target.value)} disabled={active} autoComplete="off" spellCheck="false" />
          <button type="submit" className={styles.sendButton} disabled={active || !message.trim()}>Send</button>
        </div>
        <div className={styles.controls}>
          <label className={styles.beamToggle}>
            <input type="checkbox" checked={blocked} onChange={toggleBlock} />
            <span>Block beam</span>
          </label>
          <button type="button" onClick={togglePause} disabled={!active}>{view.paused ? "Resume" : "Pause"}</button>
          <button type="button" onClick={reset} disabled={view.phase === "idle"}>Reset</button>
        </div>
      </form>

      <div className={styles.endpoints}>
        <div><span>A / transmit</span><p>{view.phase === "idle" ? message : new TextDecoder().decode(view.bytes)}</p></div>
        <div><span>B / receive</span><p className={view.phase === "done" && !view.good ? styles.corrupted : undefined}>{output || "—"}</p></div>
      </div>
      <Illustration view={view} blocked={blocked} toggleBlock={toggleBlock} part={part} choose={setPart} />
      <p className={styles.status} role="status">{status}</p>

      <div className={styles.scope} aria-label="Sent bits, post-TIA voltage, and received bits">
        <div className={styles.traceRow}><span>{view.phase === "idle" ? "To send" : "Sent"}</span><Trace bits={displayedBits} start={start} cursor={cursor} /></div>
        <div className={styles.traceRow}><span>After TIA<small>voltage</small></span><Trace bits={view.received} start={start} cursor={cursor} analog /></div>
        <div className={styles.traceRow}><span>Received</span><Trace bits={view.received} start={start} cursor={cursor} received /></div>
        {view.bits.length > 0 && <div className={styles.inspector}>
          <input type="range" min="0" max={view.bits.length - 1} value={cursor} disabled={active && !view.paused} onChange={event => setInspector(Number(event.target.value))} aria-label="Inspect a transmitted bit" />
          <span>Bit {cursor + 1}: {view.bits[cursor]} <span aria-hidden="true">→</span> {view.received[cursor] ?? "…"}</span>
        </div>}
        <p className={styles.scopeNote}>Bit-aligned traces. <a href="https://www.analog.com/media/en/technical-documentation/data-sheets/ad8015.pdf">TIA voltage</a> is illustrative, on a relative scale.</p>
      </div>

      <div className={styles.parts} role="group" aria-label="Hardware components">
        {Object.entries(parts).map(([key, item]) => <button type="button" key={key} onClick={() => setPart(part === key ? null : key)} aria-pressed={part === key}>{item.label}</button>)}
      </div>
      <p className={styles.partDetail} aria-live="polite">{part ? parts[part].text : "Each node has a Raspberry Pi, USB interface, transmitter, and receiver. Two independent beams carry data in opposite directions."}</p>
      <p className={styles.caption}>Transmission is slowed for visibility. The simulation sends raw payload bits; the planned link uses 8b/10b coding and CRC-based retries, with a 50 Mbit/s line-rate target.</p>
    </section>
  );
}
