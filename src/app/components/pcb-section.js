import PcbViewer from "./pcb-viewer";
import styles from "./pcb-section.module.css";

const labels = { "usb-interface": "USB interface", "tx-a": "TX-A", "rx-a": "RX-A" };

export default function PcbSection({ model, html }) {
  return (
    <section className={styles.section} aria-label={`${labels[model]} board`}>
      <div className={`${styles.copy} markdown-post`} dangerouslySetInnerHTML={{ __html: html }} />
      <PcbViewer model={model} label={labels[model]} />
    </section>
  );
}
