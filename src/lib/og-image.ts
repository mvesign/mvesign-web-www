// De deelafbeelding (1200 × 630): het vlak van de balk, de rand eronder en het woordmerk in het
// midden. Kleuren en woordmerk komen uit de huisstijl; het woordmerk bestaat uit paden, dus
// resvg heeft geen lettertype nodig.
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import tokens from 'mvesign-brand-assets/tokens.json';
import wordmark from 'mvesign-brand-assets/logo/wordmark.svg?raw';

const WIDTH = 1200;
const HEIGHT = 630;
const EDGE = 24;
const WORDMARK_WIDTH = 600;

export function ogSvg(): string {
  const { bar, bar_edge } = tokens.color.light;
  const viewBox = /viewBox="([^"]+)"/.exec(wordmark);
  if (!viewBox) throw new Error('wordmark.svg heeft geen viewBox');
  const [, , vbWidth, vbHeight] = viewBox[1].trim().split(/\s+/).map(Number);
  const scale = WORDMARK_WIDTH / vbWidth;
  const x = (WIDTH - WORDMARK_WIDTH) / 2;
  const y = (HEIGHT - EDGE - vbHeight * scale) / 2;
  const inner = wordmark.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${bar}"/>`,
    `<rect y="${HEIGHT - EDGE}" width="${WIDTH}" height="${EDGE}" fill="${bar_edge}"/>`,
    `<g transform="translate(${x} ${y}) scale(${scale})">${inner}</g>`,
    '</svg>',
  ].join('');
}

let ready: Promise<void> | undefined;

export async function renderOgPng(): Promise<Uint8Array> {
  // De build draait vanuit de map van het project (npm run build), dus daar staat node_modules.
  const wasmUrl = new URL('node_modules/@resvg/resvg-wasm/index_bg.wasm', pathToFileURL(`${process.cwd()}/`));
  ready ??= readFile(wasmUrl).then((wasm) => initWasm(wasm));
  await ready;
  return new Resvg(ogSvg(), { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
}
