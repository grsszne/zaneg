"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./pcb-viewer.module.css";

export default function MechanicalViewer({ model, label }) {
  const host = useRef(null);
  const scene = useRef(null);
  const helpId = useId();
  const [status, setStatus] = useState("loading");
  const [view, setView] = useState("isometric");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let started = false;
    setStatus("loading");
    const observer = new IntersectionObserver(async entries => {
      if (started || !entries.some(entry => entry.isIntersecting)) return;
      started = true;
      observer.disconnect();
      try {
        const { mountPcbViewer } = await import("./pcb-viewer-scene");
        if (cancelled) return;
        scene.current = mountPcbViewer(host.current, {
          url: `/models/laser/${model}.glb`, label, helpId, assembly: true,
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
  }, [model, label, helpId, attempt]);

  function changeView(value) {
    scene.current?.setView(value);
    setView(value);
  }

  return (
    <figure className={styles.viewer} aria-label={`${label} interactive mechanical viewer`}>
      <div ref={host} className={`${styles.stage} ${styles.assemblyStage}`}>
        {status !== "ready" && <div className={styles.placeholder} role="status">
          {status === "loading" ? "Loading assembly…" : <><span>3D view unavailable. The STEP file is available below.</span><button type="button" onClick={() => setAttempt(value => value + 1)}>Retry</button></>}
        </div>}
      </div>
      <div className={styles.toolbar} role="group" aria-label={`${label} view controls`}>
        <button type="button" disabled={status !== "ready"} aria-pressed={view === "top"} onClick={() => changeView("top")}>Top</button>
        <button type="button" disabled={status !== "ready"} aria-pressed={view === "front"} onClick={() => changeView("front")}>Front</button>
        <button type="button" disabled={status !== "ready"} aria-pressed={view === "full"} onClick={() => changeView("full")}>Full rail</button>
        <button type="button" disabled={status !== "ready"} onClick={() => changeView("isometric")}>Reset</button>
        <div className={styles.zoom}>
          <button type="button" disabled={status !== "ready"} aria-label="Zoom out" onClick={() => scene.current?.zoom(1.2)}>−</button>
          <button type="button" disabled={status !== "ready"} aria-label="Zoom in" onClick={() => scene.current?.zoom(1 / 1.2)}>+</button>
        </div>
        <a href={`/models/laser/${model}.step`} download={`${model}.step`}>STEP ↓</a>
      </div>
      <figcaption id={helpId} className={styles.caption}>Drag to rotate · Pinch to zoom. Arrow keys rotate; + / − zoom. Home resets the sled view.</figcaption>
    </figure>
  );
}
