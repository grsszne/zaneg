import evidence from "../../../public/evidence/laser/usb-optimization-findings-2026-10-31.json";
import styles from "./usb-optimization-findings.module.css";

const number = (value) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const group = (id) => evidence.loggedGroups.find((item) => item.id === id);
const values = (item) => item.runs.map((run) => run.throughputMbps);
const mean = (item) => average(values(item));
const setup = (item) => evidence.configurations[item.configurationId];
const mib = (item) => item.payloadBytes / 1048576;
const cacheGroups = ["tx_168_uncached_trace_control", "tx_168_icache_4k", "tx_216_icache_4k_initial"].map(group);
const chunkGroups = ["tx_216_icache_4k_chunk_control", "tx_216_icache_16k"].map(group);
const echoGroups = ["echo_216_icache_10mib", "echo_216_icache_100mib_4k", "echo_216_icache_100mib_16k"].map(group);
const cacheGain = (mean(cacheGroups[1]) / mean(cacheGroups[0]) - 1) * 100;
const chunkGain = (mean(chunkGroups[1]) / mean(chunkGroups[0]) - 1) * 100;

function RunTable({ groups }) {
  return (
    <details className={styles.details}>
      <summary>Run values</summary>
      <div className={styles.tableWrap}>
        <table>
          <caption>Complete logged runs; all listed transfers passed byte verification.</caption>
          <thead><tr><th scope="col">Configuration</th><th scope="col">Payload</th><th scope="col">Runs (Mbit/s)</th><th scope="col">Mean</th><th scope="col">n</th></tr></thead>
          <tbody>{groups.map((item) => {
            const config = setup(item);
            return (
              <tr key={item.id}>
                <th scope="row">{config.sysclk_mhz} MHz · I-cache {config.icache_enabled ? "on" : "off"} · {config.tx_bench_chunk_bytes / 1024} KiB TX setting</th>
                <td>{mib(item)} MiB</td>
                <td>{values(item).map(number).join(", ")}</td>
                <td>{number(mean(item))}</td>
                <td>{item.runs.length}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </details>
  );
}

function ClockChart() {
  const x = (clock) => 76 + ((clock - 96) / 120) * 610;
  const y = (rate) => 284 - (rate / 180) * 252;
  const cached = cacheGroups.slice(1);
  return (
    <>
      <p className={styles.axisTitle}>TX throughput (Mbit/s)</p>
      <svg className={styles.clockChart} viewBox="0 0 744 352" role="img" aria-labelledby="usb-cache-plot-title usb-cache-plot-description">
        <title id="usb-cache-plot-title">CPU clock and instruction cache</title>
        <desc id="usb-cache-plot-description">The reported uncached sweep peaks at 87.36 Mbit/s at 168 MHz and falls to 40.31 at 216 MHz. With I-cache enabled, four logged runs average 137.90 at 168 MHz and four average 157.13 at 216 MHz. Only those two clocks have cache-enabled measurements.</desc>
        {[0, 30, 60, 90, 120, 150, 180].map((tick) => (
          <g key={tick}>
            <line className={styles.gridLine} x1="76" x2="686" y1={y(tick)} y2={y(tick)} />
            <text className={styles.tick} x="58" y={y(tick)} dy="0.35em" textAnchor="end">{tick}</text>
          </g>
        ))}
        <polyline className={styles.reportedLine} points={evidence.reportedClockSweep.map((row) => `${x(row.clockMHz)},${y(average(row.valuesMbps))}`).join(" ")} />
        <polyline className={styles.verifiedLine} points={cached.map((item) => `${x(setup(item).sysclk_mhz)},${y(mean(item))}`).join(" ")} />
        {evidence.reportedClockSweep.map((row) => (
          <g key={row.clockMHz}>
            <circle className={styles.reportedPoint} cx={x(row.clockMHz)} cy={y(average(row.valuesMbps))} r="5">
              <title>{`${row.clockMHz} MHz, I-cache off: ${number(average(row.valuesMbps))} Mbit/s mean; ${row.valuesMbps.length} user-reported rates.`}</title>
            </circle>
            <text className={styles.tick} x={x(row.clockMHz)} y="315" textAnchor="middle">{row.clockMHz}</text>
          </g>
        ))}
        {cached.map((item) => (
          <g key={item.id}>
            <circle className={styles.verifiedPoint} cx={x(setup(item).sysclk_mhz)} cy={y(mean(item))} r="6">
              <title>{`${setup(item).sysclk_mhz} MHz, I-cache on: ${number(mean(item))} Mbit/s mean; n=${item.runs.length}; range ${number(Math.min(...values(item)))}–${number(Math.max(...values(item)))}; all PASS.`}</title>
            </circle>
            <text className={styles.valueLabel} x={x(setup(item).sysclk_mhz)} y={y(mean(item)) - 15} textAnchor="middle">{number(mean(item))}</text>
          </g>
        ))}
        <text className={styles.tick} x="381" y="347" textAnchor="middle">CPU clock (MHz)</text>
      </svg>
      <ul className={styles.legend} aria-label="Clock chart legend">
        <li><span className={styles.verifiedSwatch} aria-hidden="true" />I-cache on · logged PASS means</li>
        <li><span className={styles.reportedSwatch} aria-hidden="true" />I-cache off · reported sweep means</li>
      </ul>
      <p className={styles.note}>10 MiB TX payloads, 4 KiB submissions. Cache-enabled means each contain four logged, verified runs; the uncached sweep contains reported rates.</p>
      <RunTable groups={cacheGroups} />
      <details className={styles.details}>
        <summary>Original uncached clock sweep</summary>
        <div className={styles.tableWrap}>
          <table>
            <caption>User-reported rates; complete terminal logs are unavailable for this sweep.</caption>
            <thead><tr><th scope="col">CPU clock</th><th scope="col">Reported rates (Mbit/s)</th><th scope="col">Mean</th><th scope="col">n</th></tr></thead>
            <tbody>{evidence.reportedClockSweep.map((row) => <tr key={row.clockMHz}><th scope="row">{row.clockMHz} MHz</th><td>{row.valuesMbps.map(number).join(", ")}</td><td>{number(average(row.valuesMbps))}</td><td>{row.valuesMbps.length}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </>
  );
}

function RunChart({ groups, maximum, ticks, label, describe, chartLabel }) {
  return (
    <div className={styles.runChart} role="group" aria-label={chartLabel}>
      <p className={styles.axisTitle}>Mean throughput (Mbit/s); dots show individual verified runs</p>
      <div className={styles.runAxis} aria-hidden="true">{ticks.map((tick) => <span key={tick} style={{ left: `${tick / maximum * 100}%` }}>{tick}</span>)}</div>
      {groups.map((item) => {
        const rates = values(item);
        const low = Math.min(...rates);
        const high = Math.max(...rates);
        return (
          <div className={styles.runRow} key={item.id}>
            <div className={styles.runLabel}><strong>{label(item)}</strong><span>{describe(item)} · n={rates.length}</span></div>
            <div className={styles.runPlot} role="img" aria-label={`${label(item)}: mean ${number(mean(item))} Mbit/s; individual runs ${rates.map(number).join(", ")}; all PASS.`}>
              {ticks.map((tick) => <i key={tick} className={styles.runGrid} style={{ left: `${tick / maximum * 100}%` }} />)}
              <span className={styles.meanBar} style={{ width: `${mean(item) / maximum * 100}%` }} />
              <span className={styles.runRange} style={{ left: `${low / maximum * 100}%`, width: `max(1px, ${(high - low) / maximum * 100}%)` }} />
              {rates.map((rate, index) => <span key={index} className={styles.runDot} style={{ left: `${rate / maximum * 100}%`, top: `${10 + index * 9}px` }} title={`Run ${index + 1}: ${number(rate)} Mbit/s · PASS`} />)}
            </div>
            <div className={styles.runValue}><strong>{number(mean(item))}</strong><span>mean</span></div>
          </div>
        );
      })}
    </div>
  );
}

export default function UsbOptimizationFindings() {
  return (
    <section id="usb-optimization-findings" className={styles.section} aria-label="USB performance measurements">
      <figure className={styles.figure}>
        <figcaption><h4>Instruction cache and CPU clock</h4><p>At 168 MHz, enabling I-cache raises mean TX throughput from 87.36 to 137.90 Mbit/s ({cacheGain.toFixed(1)}%, against the prior-day control). At 216 MHz with I-cache, the mean reaches 157.13 Mbit/s.</p></figcaption>
        <ClockChart />
      </figure>

      <figure className={styles.figure}>
        <figcaption><h4>TX submission size</h4><p>At 216 MHz with I-cache, increasing submissions from 4 to 16 KiB adds {chunkGain.toFixed(2)}% to mean throughput. The fastest verified run reaches 160.40 Mbit/s.</p></figcaption>
        <RunChart groups={chunkGroups} maximum={180} ticks={[0, 40, 80, 120, 160, 180]} label={(item) => `${setup(item).tx_bench_chunk_bytes / 1024} KiB TX submission`} describe={() => "10 MiB payload"} chartLabel="Dedicated TX chunk comparison at 216 MHz" />
        <RunTable groups={chunkGroups} />
      </figure>

      <figure className={styles.figure}>
        <figcaption><h4>Streaming echo</h4><p>The 100 MiB tests settle near 76.92 Mbit/s at 216 MHz with I-cache. Throughput counts the payload once over the complete round trip.</p></figcaption>
        <RunChart groups={echoGroups} maximum={100} ticks={[0, 20, 40, 60, 80, 100]} label={(item) => `${mib(item)} MiB echo`} describe={(item) => `${setup(item).tx_bench_chunk_bytes / 1024} KiB TX setting`} chartLabel="Streaming echo results by payload size" />
        <p className={styles.note}>The 4/16 KiB labels record the TX-only setting; echo queue batching is independent of this value.</p>
        <RunTable groups={echoGroups} />
      </figure>

      <div className={styles.tuning}>
        <h4>D-cache, FIFO and DMA</h4>
        <p>Later reported rates stayed around 161 Mbit/s TX. These results have no complete transfer log or explicit full-payload PASS.</p>
        <div className={styles.tableWrap}>
          <table>
            <caption>Reported-only results, shown separately from logged PASS measurements.</caption>
            <thead><tr><th scope="col">Experiment</th><th scope="col">TX (Mbit/s)</th><th scope="col">Echo (Mbit/s)</th></tr></thead>
            <tbody>
              <tr><th scope="row">D-cache enabled</th><td>≈161</td><td>78.83</td></tr>
              <tr><th scope="row">FIFO reallocation</th><td colSpan={2}>Reported unchanged; no numerical sample</td></tr>
              <tr><th scope="row">USB DMA enabled</th><td>≈161</td><td>≈78</td></tr>
            </tbody>
          </table>
        </div>
        <p className={styles.note}>One D-cache TX transfer timed out 75,993 bytes short of 10 MiB. Its cause remains unresolved.</p>
      </div>
      <footer className={styles.footer}>
        <details className={styles.details}>
          <summary>Measurement notes</summary>
          <p>The record contains 18 successful transfers with complete logs, measured October 29–30, 2026. Sample counts include only those logs; plots use printed rates rather than rates recomputed from rounded times. Bars start at zero. Dots are individual runs, stacked vertically when close, and short range marks show observed minimum–maximum values, not confidence intervals.</p>
          <p>The uncached control is from the prior day. The dedicated chunk comparison uses its own 4 KiB control. Configuration labels follow documented settings; flashed images were not independently identified. TX submissions of 4/16 KiB do not change the 512-byte USB bulk packet size or the independent echo queue’s batching.</p>
          <p>The D-cache timeout received 10,409,767 of 10,485,760 bytes before verification. A later short echo was reported to pass. A separate, earlier trace-on test stopped 27,669 bytes short. The record does not establish a failure rate or identify the cause of either timeout or the original clock regression.</p>
        </details>
        <a href="/evidence/laser/usb-optimization-findings-2026-10-31.json" download>Chart data (JSON)</a>
      </footer>
    </section>
  );
}
