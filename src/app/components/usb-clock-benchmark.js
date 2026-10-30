import benchmark from "../../../public/evidence/laser/usb-clock-sweep-2026-10-29.json";
import styles from "./usb-echo-benchmark.module.css";

const series = [
  { key: "txOnlyMbps", label: "TX-only", lineStyle: "line", pointStyle: "point" },
  { key: "bidirectionalEchoMbps", label: "Bidirectional echo", lineStyle: "echoLine", pointStyle: "echoPoint" },
];

export default function UsbClockBenchmark() {
  const rows = benchmark.results;
  const x = (mhz) => 80 + ((mhz - 96) / 120) * 558;
  const y = (mbps) => 280 - (mbps / 100) * 240;

  return (
    <figure id="usb-clock-throughput" className={styles.figure} aria-labelledby="usb-clock-title">
      <figcaption className={styles.caption}>
        <span id="usb-clock-title" className={styles.title}>USB throughput by CPU clock</span>
        <span className={styles.subtitle}>TX-only and bidirectional echo · 96–216 MHz</span>
      </figcaption>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>USB clock sweep results transcribed from the supplied benchmark image.</caption>
          <thead>
            <tr><th scope="col">CPU clock</th><th scope="col">TX-only</th><th scope="col">Bidirectional echo</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.clockMHz}>
                <th scope="row">{row.clockMHz} MHz</th>
                <td>{row.txOnlyMbps.toFixed(2)} Mbit/s</td>
                <td>{row.bidirectionalEchoMbps.toFixed(2)} Mbit/s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.unit}>Reported throughput (Mbit/s)</p>
      <svg className={styles.chart} viewBox="0 0 680 340" role="img" aria-labelledby="usb-clock-chart-title usb-clock-chart-description">
        <title id="usb-clock-chart-title">USB throughput by CPU clock</title>
        <desc id="usb-clock-chart-description">
          TX-only throughput peaks at 87.36 Mbit/s at 168 MHz, then drops to 39.03
          at 192 MHz and 40.31 at 216 MHz. Bidirectional echo increases from 15.50
          to 23.01 Mbit/s across the clock sweep. All five readings for both series
          are listed in the table above. The horizontal axis uses a linear MHz scale.
        </desc>
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line x1="80" x2="638" y1={y(tick)} y2={y(tick)} className={styles.grid} />
            <text x="58" y={y(tick)} dy="0.35em" textAnchor="end" className={styles.label}>{tick}</text>
          </g>
        ))}
        {series.map((item) => (
          <g key={item.key}>
            <polyline points={rows.map((row) => `${x(row.clockMHz)},${y(row[item.key])}`).join(" ")} className={styles[item.lineStyle]} />
            {rows.map((row) => (
              <circle key={row.clockMHz} cx={x(row.clockMHz)} cy={y(row[item.key])} r="4.5" className={styles[item.pointStyle]}>
                <title>{row.clockMHz} MHz · {item.label}: {row[item.key].toFixed(2)} Mbit/s</title>
              </circle>
            ))}
          </g>
        ))}
        {rows.map((row) => (
          <text key={row.clockMHz} x={x(row.clockMHz)} y="310" textAnchor="middle" className={styles.label}>{row.clockMHz}</text>
        ))}
        <text x="359" y="337" textAnchor="middle" className={styles.label}>CPU clock (MHz)</text>
      </svg>
      <ul className={styles.legend} aria-label="Chart legend">
        <li><span className={styles.txSwatch} aria-hidden="true" />TX-only</li>
        <li><span className={styles.echoSwatch} aria-hidden="true" />Bidirectional echo</li>
      </ul>
    </figure>
  );
}
