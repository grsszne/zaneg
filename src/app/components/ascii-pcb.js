'use client';

import { useEffect, useRef, useState } from 'react';
import { BOARD_ROWS, generateBoard } from '../lib/ascii-pcb.mjs';
import styles from './ascii-pcb.module.css';

const EMPTY = { components: '\n'.repeat(BOARD_ROWS - 1), copper: '', substrate: '' };

export default function AsciiPcb() {
  const host = useRef(null);
  const [revision, setRevision] = useState(0);
  const [frame, setFrame] = useState(EMPTY);

  useEffect(() => {
    const element = host.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    let visible = false;
    let disposed = false;
    let columns = 0;
    let frames = [];
    const finish = () => {
      clearTimeout(timer);
      if (frames.length) setFrame(frames[frames.length - 1]);
    };
    const build = () => {
      if (!visible || disposed) return;
      const probe = element.querySelector('pre');
      const context = document.createElement('canvas').getContext('2d');
      const style = getComputedStyle(probe);
      context.font = `${style.fontSize} ${style.fontFamily}`;
      // Draw beyond both edges so the board crops naturally to the viewport.
      const nextColumns = Math.max(100, Math.ceil(element.clientWidth / context.measureText('M').width)) + 24;
      if (nextColumns === columns) return;
      columns = nextColumns;
      clearTimeout(timer);
      frames = generateBoard(columns);
      if (motion.matches) return finish();
      const start = performance.now();
      const step = () => {
        const progress = Math.min(1, (performance.now() - start) / 2200);
        setFrame(frames[Math.min(frames.length - 1, Math.floor(progress * frames.length))]);
        if (progress < 1) timer = setTimeout(step, 40);
      };
      step();
    };
    const intersection = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        visible = true;
        build();
        intersection.disconnect();
      }
    }, { threshold: 0.15 });
    const resize = new ResizeObserver(build);
    intersection.observe(element);
    resize.observe(element);
    document.fonts.ready.then(build);
    motion.addEventListener('change', finish);
    return () => {
      disposed = true;
      clearTimeout(timer);
      intersection.disconnect();
      resize.disconnect();
      motion.removeEventListener('change', finish);
    };
  }, [revision]);

  return (
    <div className={styles.board} ref={host}>
      <div className={styles.art} aria-hidden="true">
        <pre className={styles.substrate}>{frame.substrate}</pre>
        <pre className={styles.copper}>{frame.copper}</pre>
        <pre className={styles.components}>{frame.components}</pre>
      </div>
      <button className={styles.regenerate} type="button" onClick={() => setRevision(value => value + 1)} aria-label="Regenerate ASCII circuit board" title="Regenerate circuit board">
        <span aria-hidden="true">↻</span>
      </button>
    </div>
  );
}
