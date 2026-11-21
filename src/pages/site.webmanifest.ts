import type { APIRoute } from 'astro';
import tokens from 'mvesign-brand-assets/tokens.json';
import icon192 from 'mvesign-brand-assets/logo/icon-192.png?url&no-inline';
import icon512 from 'mvesign-brand-assets/logo/icon-512.png?url&no-inline';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: 'mvesign',
      short_name: 'mvesign',
      start_url: '/',
      display: 'browser',
      theme_color: tokens.color.light.bar,
      background_color: tokens.color.light.bg,
      icons: [
        { src: icon192, sizes: '192x192', type: 'image/png' },
        { src: icon512, sizes: '512x512', type: 'image/png' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
