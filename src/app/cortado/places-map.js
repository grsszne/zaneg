"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { createMapStyle, ratings } from "./map-style";
import styles from "./cortado.module.css";

function pageColors() {
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(Object.entries({
    background: "--background", surface: "--surface", line: "--line",
    muted: "--muted", primary: "--signal-primary", secondary: "--signal-secondary",
  }).map(([key, variable]) => [key, css.getPropertyValue(variable).trim()]));
}

export default function PlacesMap({ places }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const pinned = places.filter((place) => place.coordinates);

  useEffect(() => {
    let disposed = false;
    let map;
    let resize;
    let popup;
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const themeChanged = () => map?.setStyle(createMapStyle(pageColors()));
    setStatus("loading");

    async function initialize() {
      try {
        const maplibre = await import("maplibre-gl");
        if (disposed) return;
        maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        const locations = places.filter((place) => place.coordinates);
        const bounds = new maplibre.LngLatBounds();
        locations.forEach((place) => bounds.extend(place.coordinates));
        map = new maplibre.Map({
          container: container.current,
          style: createMapStyle(pageColors()),
          center: [-96.704, 33.033],
          zoom: 11,
          ...(locations.length ? { bounds, fitBoundsOptions: { padding: 65, maxZoom: 13 } } : {}),
          cooperativeGestures: true,
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new maplibre.AttributionControl({ compact: false }), "bottom-right");
        map.on("load", () => { if (!disposed) setStatus("ready"); });
        map.on("error", () => { if (!disposed) setStatus("error"); });
        map.on("idle", () => { if (!disposed && map.areTilesLoaded()) setStatus("ready"); });

        locations.forEach((place) => {
          const rating = ratings[place.rating];
          const marker = document.createElement("button");
          marker.type = "button";
          marker.className = styles.marker;
          marker.style.setProperty("--rank-color", rating.color);
          marker.textContent = place.name;
          marker.setAttribute("aria-label", `${place.name}: ${rating.label}. Show notes`);
          marker.addEventListener("click", () => {
            popup?.remove();
            const content = document.createElement("div");
            content.className = styles.popupContent;
            const title = document.createElement("strong");
            title.textContent = place.name;
            const rank = document.createElement("p");
            rank.textContent = `Coffee: ${rating.label.toLowerCase()}`;
            rank.className = styles.popupRating;
            const note = document.createElement("p");
            note.textContent = place.coffee;
            const link = document.createElement("a");
            link.href = `#${place.id}`;
            link.textContent = "Ledger entry";
            content.append(title, rank, note);
            if (place.notes) {
              const notes = document.createElement("p");
              notes.className = styles.extraNotes;
              notes.textContent = place.notes;
              content.append(notes);
            }
            content.append(link);
            popup = new maplibre.Popup({ offset: 18, maxWidth: "300px", className: styles.popup })
              .setLngLat(place.coordinates).setDOMContent(content).addTo(map);
          });
          new maplibre.Marker({ element: marker }).setLngLat(place.coordinates).addTo(map);
        });

        resize = new ResizeObserver(() => map.resize());
        resize.observe(container.current);
        scheme.addEventListener("change", themeChanged);
      } catch {
        if (!disposed) setStatus("error");
      }
    }

    initialize();
    return () => {
      disposed = true;
      scheme.removeEventListener("change", themeChanged);
      resize?.disconnect();
      popup?.remove();
      map?.remove();
      mapRef.current = null;
    };
  }, [places, attempt]);

  function resetView() {
    if (!mapRef.current || !pinned.length) return;
    const longitudes = pinned.map((place) => place.coordinates[0]);
    const latitudes = pinned.map((place) => place.coordinates[1]);
    mapRef.current.fitBounds([
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ], { padding: 65, maxZoom: 13, duration: 0 });
  }

  return (
    <section className={styles.mapSection} aria-label="Map of coffee shops">
      <div className={styles.mapHeader}>
        <ul className={styles.legend} aria-label="Cortado rankings">
          <li>Coffee:</li>
          {Object.entries(ratings).map(([id, rating]) => (
            <li key={id}><span aria-hidden="true" style={{ background: rating.color }} />{rating.label}</li>
          ))}
        </ul>
        <button type="button" className={styles.resetMap} onClick={resetView} disabled={status === "loading"}>All places</button>
      </div>
      <div className={styles.mapFrame}>
        <div ref={container} className={styles.mapCanvas} aria-label="Interactive map of North Dallas coffee shops" />
        {status === "loading" && <p className={styles.mapStatus} role="status">Loading map…</p>}
        {status === "error" && (
          <p className={styles.mapStatus} role="status">Map unavailable. The map links above still work. <button type="button" onClick={() => setAttempt((value) => value + 1)}>Retry</button></p>
        )}
      </div>
      <noscript><p className={styles.mapFootnote}>Enable JavaScript to use the map, or use the links in the ledger.</p></noscript>
    </section>
  );
}
