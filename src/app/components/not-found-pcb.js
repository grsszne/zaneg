'use client';

import { useEffect, useRef, useState } from 'react';
import { collapsePcb } from '../lib/pcb-gravity.mjs';
import styles from './not-found-pcb.module.css';

export default function NotFoundPcb({ collapsing = false, onCollapsed }) {
  const host = useRef(null);
  const canvas = useRef(null);
  const [frame, setFrame] = useState(null);
  const [falling, setFalling] = useState(false);

  useEffect(() => {
    if (collapsing) return;
    const element = host.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let worker;
    let resizeTimer;
    let animation;
    let lastFrame;
    let hasRendered = false;
    let dimensions = '';
    let disposed = false;

    const finish = () => {
      cancelAnimationFrame(animation);
      if (lastFrame) setFrame(lastFrame);
    };
    const build = () => {
      if (disposed) return;
      const style = getComputedStyle(element.querySelector('pre'));
      const context = document.createElement('canvas').getContext('2d');
      context.font = `${style.fontSize} ${style.fontFamily}`;
      const cellWidth = context.measureText('M').width;
      const cellHeight = parseFloat(style.lineHeight);
      const width = Math.max(100, Math.ceil(element.clientWidth / cellWidth) + 24);
      const height = Math.ceil(element.clientHeight / cellHeight) + 8;
      const nextDimensions = `${width}:${height}`;
      if (dimensions === nextDimensions) return;
      dimensions = nextDimensions;
      worker?.terminate();
      cancelAnimationFrame(animation);
      const nextWorker = new Worker(new URL('../lib/pcb-404.worker.js', import.meta.url));
      worker = nextWorker;
      worker.onmessage = ({ data: { frames, footprints } }) => {
        if (disposed || worker !== nextWorker) return;
        nextWorker.terminate();
        lastFrame = { ...frames.at(-1), footprints };
        const animate = !motion.matches && !hasRendered;
        hasRendered = true;
        if (!animate) return finish();
        const start = performance.now();
        let previous = -1;
        const step = () => {
          const progress = Math.min(1, (performance.now() - start) / 1800);
          const index = Math.min(frames.length - 1, Math.floor(progress * frames.length));
          if (index !== previous) { setFrame({ ...frames[index], footprints }); previous = index; }
          if (progress < 1) animation = requestAnimationFrame(step);
        };
        step();
      };
      worker.postMessage({ width, height, cellAspect: cellWidth / cellHeight });
    };
    const resize = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 160);
    });
    document.fonts.ready.then(() => {
      if (disposed) return;
      build();
      resize.observe(element);
    });
    motion.addEventListener('change', finish);
    return () => {
      disposed = true;
      worker?.terminate();
      resize.disconnect();
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animation);
      motion.removeEventListener('change', finish);
    };
  }, [collapsing]);

  useEffect(() => {
    if (!collapsing) return;
    const stop = collapsePcb(host.current, canvas.current, onCollapsed, frame?.footprints);
    setFalling(true);
    return stop;
  }, [collapsing, onCollapsed, frame]);

  return (
    <div className={styles.board} ref={host} data-falling={falling} aria-hidden="true">
      <pre className={styles.substrate}>{frame?.substrate}</pre>
      <pre className={styles.copper}>{frame?.copper}</pre>
      <pre className={styles.components}>{frame?.components}</pre>
      <canvas className={styles.gravity} ref={canvas} />
    </div>
  );
}
