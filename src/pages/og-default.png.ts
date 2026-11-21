import type { APIRoute } from 'astro';
import { renderOgPng } from '../lib/og-image';

export const GET: APIRoute = async () =>
  new Response((await renderOgPng()) as Uint8Array<ArrayBuffer>, { headers: { 'Content-Type': 'image/png' } });
