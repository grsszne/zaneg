"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./pcb-viewer.module.css";
import { pcbAnnotations } from "./pcb-annotations";

export default function PcbViewer({ model, label }) {
  const host = useRef(null);
  const scene = useRef(null);
  const helpId = useId();
  const [status, setStatus] = useState("loading");
  const [view, setView] = useState("isometric");
  const [attempt, setAttempt] = useState(0);
  const annotations = pcbAnnotations[model];
  const [pins, setPins] = useState([]);
  const [labels, setLabels] = useState(true);
  const [copper, setCopper] = useState(false);
  const [selected, setSelected] = useState(annotations[0].ref);
  const detail = annotations.find(item => item.ref === selected);

  useEffect(() => {
    let cancelled = false;
    let started = false;
    setStatus("loading");
    setCopper(false);
    const observer = new IntersectionObserver(async entries => {
      if (started || !entries.some(entry => entry.isIntersecting)) return;
      started = true;
      observer.disconnect();
      try {
        const { mountPcbViewer } = await import("./pcb-viewer-scene");
        if (cancelled) return;
        scene.current = mountPcbViewer(host.current, {
          url: `/models/laser/${model}.glb`, label, helpId,
          annotations, onPins: value => { if (!cancelled) setPins(value); },
          onReady: () => { if (!cancelled) setStatus("ready"); },
          onError: () => { if (!cancelled) setStatus("error"); },
          onViewChange: value => { if (!cancelled) setView(value); },
        });
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, { rootMargin: "250px" });
    observer.observe(host.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [model, label, helpId, attempt, annotations]);

  function changeView(value) {
    scene.current?.setView(value);
    setView(value);
  }

  return (
    <figure className={styles.viewer} aria-label={`${label} interactive PCB viewer`}>
      <div ref={host} className={styles.stage}>
        {labels && status === "ready" && <div className={styles.pins}>
          {annotations.map((item, index) => {
            const pin = pins.find(pin => pin.ref === item.ref);
            return pin?.visible && <button key={item.ref} type="button" className={styles.pin}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              aria-label={`${item.ref}: ${item.title}`} aria-pressed={selected === item.ref}
              title={`${item.ref} · ${item.title}`} onClick={() => setSelected(item.ref)}>{index + 1}</button>;
          })}
        </div>}
        {status !== "ready" && <div className={styles.placeholder} role="status">
          {status === "loading" ? "Loading model…" : <><span>3D view unavailable.</span><button type="button" onClick={() => setAttempt(value => value + 1)}>Retry</button></>}
        </div>}
      </div>
      <div className={styles.toolbar} role="group" aria-label={`${label} view controls`}>
        <button type="button" disabled={status !== "ready"} aria-pressed={view === "top"} onClick={() => changeView("top")}>Top</button>
        <button type="button" disabled={status !== "ready"} aria-pressed={view === "bottom"} onClick={() => changeView("bottom")}>Bottom</button>
        <button type="button" disabled={status !== "ready"} onClick={() => changeView("isometric")}>Reset</button>
        <div className={styles.zoom}>
          <button type="button" disabled={status !== "ready"} aria-label="Zoom out" onClick={() => scene.current?.zoom(1.2)}>−</button>
          <button type="button" disabled={status !== "ready"} aria-label="Zoom in" onClick={() => scene.current?.zoom(1 / 1.2)}>+</button>
        </div>
        <a href={`/models/laser/${model}.step`} download={`${model}.step`}>STEP ↓</a>
      </div>
      <div className={styles.options}>
        <label><input type="checkbox" checked={copper} disabled={status !== "ready"} onChange={event => { setCopper(event.target.checked); scene.current?.showCopper(event.target.checked); }} />Show copper</label>
        <label><input type="checkbox" checked={labels} onChange={event => setLabels(event.target.checked)} />Labels</label>
      </div>
      {labels && <div className={styles.annotation} aria-live="polite">
        <div className={styles.annotationHeading}>
          <span>{detail.ref} · {detail.title}</span>
          <div className={styles.annotationNav}>
            {annotations.map((item, index) => <button key={item.ref} type="button" aria-label={`Inspect ${item.ref}: ${item.title}`} aria-pressed={selected === item.ref} onClick={() => setSelected(item.ref)}>{index + 1}</button>)}
          </div>
        </div>
        <p>{detail.description}</p>
      </div>}
      <figcaption id={helpId} className={styles.caption}>Drag to rotate · Pinch to zoom. Arrow keys rotate; + / − zoom.</figcaption>
    </figure>
  );
}
