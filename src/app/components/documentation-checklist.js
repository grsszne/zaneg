"use client";

import { useId, useState } from "react";
import SignalExplorer from "./signal-explorer";
import styles from "./documentation-checklist.module.css";

export default function DocumentationChecklist({ stages }) {
  const [expandedStage, setExpandedStage] = useState(0);
  const id = useId();
  const items = stages.flatMap((stage) => stage.items);
  const completed = items.filter(item => item.checked).length;

  return (
    <section className={styles.checklist} aria-label="Website documentation checklist">
      <div className={styles.header}>
        <h3>Documentation checklist</h3>
        <span className={styles.count} aria-live="polite">{completed} / {items.length} complete</span>
      </div>
      <div className={styles.stages}>
        {stages.map((stage, index) => (
          <div key={stage.title} className={styles.stage} data-expanded={expandedStage === index}>
            <h4>
            <button
              type="button"
              className={styles.trigger}
              id={`${id}-trigger-${index}`}
              aria-expanded={expandedStage === index}
              aria-controls={`${id}-panel-${index}`}
              onClick={() => setExpandedStage(expandedStage === index ? null : index)}
            >
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span>{stage.title}</span>
              <span className={styles.count}>{stage.items.filter(item => item.checked).length} / {stage.items.length}</span>
              <span className={styles.indicator} aria-hidden="true" />
            </button>
            </h4>
            <div
              className={styles.panel}
              id={`${id}-panel-${index}`}
              role="region"
              aria-labelledby={`${id}-trigger-${index}`}
              aria-hidden={expandedStage !== index}
              inert={expandedStage !== index}
            >
            <div className={styles.clip}>
            <div className={styles.body}>
              {stage.notes && <div className={styles.notes} dangerouslySetInnerHTML={{ __html: stage.notes }} />}
              <ul>
                {stage.items.map((item) => (
                  <li key={item.id}>
                    <label className={item.checked ? styles.complete : undefined}>
                      <input type="checkbox" checked={item.checked} disabled />
                      <span dangerouslySetInnerHTML={{ __html: item.html }} />
                    </label>
                    {item.widget && expandedStage === index && <SignalExplorer kind={item.widget} />}
                  </li>
                ))}
              </ul>
            </div>
            </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
