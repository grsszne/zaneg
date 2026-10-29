import benchmark from "../../../public/evidence/laser/usb-echo-benchmark-2026-10-29.json";
import styles from "./usb-echo-benchmark.module.css";

export default function UsbEchoBenchmark() {
  const rows = benchmark.results;
  const x = (index) => 80 + index * 186;
  const y = (mbps) => 280 - (mbps / 10) * 240;
  const points = rows.map((row, index) => `${x(index)},${y(row.throughputMbps)}`).join(" ");

  return (
    <figure className={styles.figure} aria-labelledby="usb-benchmark-title">
      <figcaption className={styles.caption}>
        <span id="usb-benchmark-title" className={styles.title}>USB echo throughput by chunk size</span>
        <span className={styles.subtitle}>200 verified round trips per chunk size</span>
      </figcaption>
      <p className={styles.unit}>Payload throughput (Mbit/s)</p>
      <svg className={styles.chart} viewBox="0 0 680 340" role="img" aria-labelledby="usb-chart-title usb-chart-description">
        <title id="usb-chart-title">USB echo throughput by chunk size</title>
        <desc id="usb-chart-description">
          Throughput rises from {rows[0].throughputMbps.toFixed(3)} Mbit/s at 64 bytes
          to {rows[3].throughputMbps.toFixed(3)} Mbit/s at 512 bytes. Exact values and
          average round-trip times are in the table below.
        </desc>
        {[0, 2, 4, 6, 8, 10].map((tick) => (
          <g key={tick}>
            <line x1="80" x2="638" y1={y(tick)} y2={y(tick)} className={styles.grid} />
            <text x="58" y={y(tick)} dy="0.35em" textAnchor="end" className={styles.label}>{tick}</text>
          </g>
        ))}
        <polyline points={points} className={styles.line} />
        {rows.map((row, index) => (
          <g key={row.chunkBytes}>
            <circle cx={x(index)} cy={y(row.throughputMbps)} r="4.5" className={styles.point} />
            <text x={x(index)} y="310" textAnchor="middle" className={styles.label}>{row.chunkBytes}</text>
          </g>
        ))}
        <text x="359" y="337" textAnchor="middle" className={styles.label}>Chunk size (bytes)</text>
      </svg>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Measured USB echo performance, October 29, 2026. All rows passed byte-for-byte verification.</caption>
          <thead>
            <tr><th scope="col">Chunk size</th><th scope="col">Avg. round trip</th><th scope="col">Throughput</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.chunkBytes}>
                <th scope="row">{row.chunkBytes} B</th>
                <td>{Math.round(row.averageRoundTripMicroseconds)} µs</td>
                <td>{row.throughputMbps.toFixed(3)} Mbit/s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
