// Vite geeft bij ?url&no-inline altijd een URL naar een bestand in _astro/, ook voor kleine
// bestanden die anders als data-URL in de HTML zouden komen.
declare module '*?url&no-inline' {
  const url: string;
  export default url;
}
