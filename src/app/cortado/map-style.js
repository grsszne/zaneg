// OpenFreeMap's OpenMapTiles sources, with colors supplied by the page theme.
// https://openfreemap.org/quick_start/
export function createMapStyle(colors) {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      streets: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
        attribution: '<a href="https://openfreemap.org/">OpenFreeMap</a> © <a href="https://openmaptiles.org/">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": colors.background } },
      { id: "land", type: "fill", source: "streets", "source-layer": "landuse", paint: { "fill-color": colors.surface } },
      { id: "parks", type: "fill", source: "streets", "source-layer": "park", paint: { "fill-color": colors.secondary, "fill-opacity": 0.1 } },
      { id: "water", type: "fill", source: "streets", "source-layer": "water", paint: { "fill-color": colors.primary, "fill-opacity": 0.22 } },
      { id: "buildings", type: "fill", source: "streets", "source-layer": "building", minzoom: 13, paint: { "fill-color": colors.line } },
      {
        id: "roads", type: "line", source: "streets", "source-layer": "transportation",
        filter: ["in", "class", "motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service"],
        paint: {
          "line-color": colors.line,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 12, ["match", ["get", "class"], ["motorway", "trunk", "primary"], 3, 1], 16, 7],
        },
      },
      {
        id: "road-names", type: "symbol", source: "streets", "source-layer": "transportation_name", minzoom: 11,
        layout: { "symbol-placement": "line", "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]], "text-font": ["Noto Sans Regular"], "text-size": 12 },
        paint: { "text-color": colors.muted, "text-halo-color": colors.background, "text-halo-width": 2 },
      },
      {
        id: "place-names", type: "symbol", source: "streets", "source-layer": "place",
        layout: { "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]], "text-font": ["Noto Sans Regular"], "text-size": 14 },
        paint: { "text-color": colors.muted, "text-halo-color": colors.background, "text-halo-width": 2 },
      },
    ],
  };
}

export const ratings = {
  "very-good": { label: "Very good", color: "var(--signal-primary)" },
  good: { label: "Good", color: "var(--signal-secondary)" },
  avoid: { label: "Avoid", color: "var(--signal-error)" },
  unrated: { label: "Not rated", color: "var(--muted)" },
};
