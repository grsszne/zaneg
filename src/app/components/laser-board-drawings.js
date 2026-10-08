import { memo } from "react";
import usbLayout from "./usb-board-layout.json";
import opticalLayouts from "./optical-board-layout.json";
import styles from "./laser-architecture.module.css";

function MountingHole({ x, y, radius = 1.4 }) {
  return <g><circle cx={x} cy={y} r={radius + 0.7} className={styles.pcbMetal} /><circle cx={x} cy={y} r={radius} className={styles.board} /></g>;
}

// Preserve both placement and rotation from the STEP assembly. Only the
// component outlines are simplified, so small parts remain legible in the demo.
export const OpticalBoard = memo(function OpticalBoard({ model, x, y, reverse = false }) {
  const { width, height, components } = opticalLayouts[model];
  return <g transform={`translate(${x} ${y}) scale(1.4)`}>
    <g transform={reverse ? `translate(${width} 0) scale(-1 1)` : undefined} className={styles.pcbDrawing}>
      <g transform={reverse ? undefined : `rotate(180 ${width / 2} ${height / 2})`}>
        <rect width={width} height={height} rx="2.8" className={`${styles.board} ${styles.pcbOutline}`} />
        {[[3, 3], [width - 3, 3], [3, height - 3], [width - 3, height - 3]].map(([x, y]) => <MountingHole key={`${x}-${y}`} x={x} y={y} radius={1.6} />)}
        {components.map(({ ref, cx, cy, width: w, height: h, angle }) => {
          const photodiode = model === "rx-a" && ref === "D1";
          const terminal = model === "tx-a" && ref === "J3";
          const connector = ref.startsWith("J");
          const ic = ref.startsWith("U");
          return <g key={ref} transform={`translate(${cx} ${cy}) rotate(${angle})`}>
            {photodiode ? <><circle r={w / 2} className={styles.pcbMetal} /><circle r={w * 0.29} className={`${styles.chip} ${styles.pcbPackage}`} /><path d={`M${-w / 2} 0h-1.2`} /></> : <>
              <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={connector ? 0.5 : 0.15} className={connector ? styles.pcbMetal : styles.pcbPackage} />
              {ic && <g className={styles.pcbDetail}>{Array.from({ length: Math.min(8, Math.max(3, Math.round(w))) }, (_, i) => {
                const px = -w / 2 + (i + 0.5) * w / Math.min(8, Math.max(3, Math.round(w)));
                return <path key={i} d={`M${px} ${-h / 2}v-0.7 M${px} ${h / 2}v0.7`} />;
              })}</g>}
              {terminal && [-1.3, 1.3].map(px => <g key={px}><circle cx={px} r="0.95" className={styles.board} /><path d={`M${px - 0.55} -0.55l1.1 1.1`} /></g>)}
              {connector && !terminal && <g className={styles.pcbContacts}>
                {Array.from({ length: model === "rx-a" && ref === "J2" ? 14 : 4 }, (_, i) => {
                  const count = model === "rx-a" && ref === "J2" ? 14 : 4;
                  return <rect key={i} x={w > h ? -w / 2 + (i + 0.5) * w / count - 0.3 : -0.3} y={h > w ? -h / 2 + (i + 0.5) * h / count - 0.3 : -0.3} width="0.6" height="0.6" />;
                })}
              </g>}
            </>}
          </g>;
        })}
      </g>
    </g>
  </g>;
});

// Top view, in millimetres. Layout follows the Pi 5 and official Active Cooler.
// https://www.raspberrypi.com/products/active-cooler/
export const Pi5Board = memo(function Pi5Board({ x, y, reverse = false }) {
  return <g transform={`translate(${x} ${y}) scale(1.4)`}>
    <g transform={reverse ? "translate(85 0) scale(-1 1)" : undefined} className={styles.pcbDrawing}>
      <rect width="85" height="56" rx="3" className={`${styles.board} ${styles.pcbOutline}`} />
      {[[3.5, 3.5], [61.5, 3.5], [3.5, 52.5], [61.5, 52.5]].map(([x, y]) => <MountingHole key={`${x}-${y}`} x={x} y={y} />)}
      {/* Forty-pin GPIO header, two stacked USB pairs, and Ethernet. */}
      <rect x="7.1" y="1" width="51" height="5.5" className={styles.pcbPackage} />
      {Array.from({ length: 20 }, (_, i) => <g key={i} className={styles.pcbContacts}><rect x={8 + i * 2.54} y="1.7" width="0.8" height="0.8" /><rect x={8 + i * 2.54} y="4.3" width="0.8" height="0.8" /></g>)}
      {[1.5, 19.5].map(y => <g key={y}>
        <rect x="71" y={y} width="16" height="13.5" rx="0.7" className={styles.pcbMetal} />
        <path d={`M84 ${y + 1}v11.5 M73 ${y + 3}h5v2h-5z M73 ${y + 8}h5v2h-5z`} className={styles.pcbDetail} />
      </g>)}
      <rect x="65" y="37.5" width="22" height="16" rx="0.8" className={styles.pcbMetal} />
      <path d="M83 39v13 M66 41h4v3h-4 M66 47h4v3h-4" className={styles.pcbDetail} />
      {/* USB-C power, two micro-HDMI ports, camera/display FFCs and PCIe. */}
      <rect x="6" y="51" width="9" height="6.3" rx="1.4" className={styles.pcbMetal} />
      {[25, 39].map(x => <g key={x}><path d={`M${x} 51h8v6h-8z`} className={styles.pcbMetal} /><path d={`M${x + 1} 55h6`} /></g>)}
      {[44, 57].map(x => <g key={x}><rect x={x} y="42.5" width="3.2" height="10.5" className={styles.pcbMetal} /><path d={`M${x + 1} 43.5v8.5`} /></g>)}
      <rect x="0.8" y="28" width="3" height="12" className={styles.pcbMetal} />
      <rect x="58" y="27" width="9" height="8" className={styles.pcbPackage} />
      <rect x="0.5" y="15" width="3.5" height="5" rx="0.6" className={styles.pcbMetal} />
      {/* Stepped heatsink base, fin bank, blower housing and two push pins. */}
      <path d="M7 9h48v3h7v26H49v8H8v4H4V15h3z" className={styles.pcbMetal} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${6 + i * 2} 15v29`} className={styles.coolerFin} />)}
      <path d="M31 12h27v25H31z" className={styles.pcbMetal} />
      <circle cx="44.5" cy="24.5" r="10.8" className={styles.pcbPackage} />
      {Array.from({ length: 13 }, (_, i) => <path key={i} transform={`rotate(${i * 360 / 13} 44.5 24.5)`} d="M44 20q-5-2-4-5q5-1 7 5" className={styles.fanBlade} />)}
      <circle cx="44.5" cy="24.5" r="4.8" className={styles.pcbPackage} />
      <circle cx="7" cy="47" r="2" className={styles.board} />
      <circle cx="56" cy="10" r="2" className={styles.board} />
      <path d="M57 17q8 1 7-6t3-3 M57 18q9 1 8-7t2-2" className={styles.pcbDetail} />
      <rect x="65.5" y="7" width="4" height="3.5" className={styles.board} />
    </g>
  </g>;
});

// Component envelopes come directly from the USB interface STEP assembly.
// Board coordinates are normalized to its 72 × 45 mm outline.
export const UsbInterfaceBoard = memo(function UsbInterfaceBoard({ x, y, reverse = false }) {
  return <g transform={`translate(${x} ${y}) scale(1.4)`}>
    <g transform={reverse ? "translate(72 0) scale(-1 1)" : undefined} className={styles.pcbDrawing}>
      <rect width="72" height="45" rx="2.8" className={`${styles.board} ${styles.pcbOutline}`} />
      {[[3, 3], [69, 3], [3, 42], [69, 42]].map(([x, y]) => <MountingHole key={`${x}-${y}`} x={x} y={y} radius={1.6} />)}
      {usbLayout.map(({ ref, x, y, width, height }) => {
        if (ref === "U1") return <g key={ref}>
          {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${x + 2.5 + i} ${y}v2 M${x + 2.5 + i} ${y + height - 2}v2 M${x} ${y + 2.5 + i}h2 M${x + width - 2} ${y + 2.5 + i}h2`} className={styles.pcbDetail} />)}
          <rect x={x + 2} y={y + 2} width={width - 4} height={height - 4} rx="0.5" className={`${styles.chip} ${styles.pcbPackage}`} />
          <circle cx={x + 4} cy={y + 4} r="0.6" className={styles.pcbContacts} />
        </g>;
        const connector = ref.startsWith("J");
        return <g key={ref}>
          <rect x={x} y={y} width={width} height={height} rx={connector ? 0.5 : 0.15} className={connector || ref.startsWith("Y") ? styles.pcbMetal : styles.pcbPackage} />
          {ref === "J2" && <rect x={x + width - 1.8} y={y + 1} width="1.4" height={height - 2} rx="0.6" className={styles.pcbPackage} />}
          {ref === "J3" && <rect x={x + 1} y={y + 0.5} width={width - 2} height="1.4" rx="0.6" className={styles.pcbPackage} />}
          {connector && !["J2", "J3"].includes(ref) && Array.from({ length: ref === "J8" ? 14 : Number({ J1: 5, J4: 3, J5: 3, J6: 4, J7: 2 }[ref] || 2) }, (_, i) => {
            const count = ref === "J8" ? 14 : Number({ J1: 5, J4: 3, J5: 3, J6: 4, J7: 2 }[ref] || 2);
            return <rect key={i} x={width > height ? x + (i + 0.5) * width / count - 0.35 : x + width / 2 - 0.35} y={height > width ? y + (i + 0.5) * height / count - 0.35 : y + height / 2 - 0.35} width="0.7" height="0.7" className={styles.pcbContacts} />;
          })}
        </g>;
      })}
    </g>
  </g>;
});
