/** Breedte en hoogte uit de IHDR-chunk, die altijd direct na de handtekening komt. */
export function pngSize(png) {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}
