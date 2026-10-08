import styles from "./cortado.module.css";

export default function CortadoLedger({ places }) {
  return (
    <div className={styles.ledger} role="region" aria-label="Cortado notes; scroll horizontally on small screens" tabIndex={0}>
      <table aria-label="Cortado ledger">
        <thead>
          <tr>
            <th scope="col">Place</th>
            <th scope="col">Notes</th>
            <th scope="col">Internet</th>
            <th scope="col">Seating</th>
          </tr>
        </thead>
        <tbody>
          {places.map((place) => (
            <tr key={place.id} id={place.id}>
              <th scope="row">
                {place.name}
                {place.address && (
                  <a
                    className={styles.mapLink}
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.address}`)}`}
                    aria-label={`Map of ${place.name}, ${place.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >map</a>
                )}
              </th>
              <td>
                {place.coffee}
                {place.notes && <p className={styles.extraNotes}>{place.notes}</p>}
                {place.visits.length > 0 && (
                  <details className={styles.visits}>
                    <summary>Visits</summary>
                    {place.visits.map((visit, index) => (
                      <p key={`${visit.date}-${index}`}><time dateTime={visit.date}>{visit.date}</time> — {visit.note}</p>
                    ))}
                  </details>
                )}
              </td>
              <td>{place.internet ?? <span aria-label="Not recorded">—</span>}</td>
              <td>{place.seating ?? <span aria-label="Not recorded">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
