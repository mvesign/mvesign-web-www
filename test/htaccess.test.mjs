import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDist, existsInDist } from './helpers/dist.mjs';

const htaccess = await readDist('.htaccess');

const DESIGN_PATTERNS = {
  'design-patterns-proxy': 'DesignPatterns.Structural.Proxy',
  'design-patterns-flyweight': 'DesignPatterns.Structural.Flyweight',
  'design-patterns-composite': 'DesignPatterns.Structural.Composite',
  'design-patterns-decorator': 'DesignPatterns.Structural.Decorator',
  'design-patterns-facade': 'DesignPatterns.Structural.Facade',
  'design-patterns-bridge': 'DesignPatterns.Structural.Bridge',
  'design-patterns-abstract-factory': 'DesignPatterns.Creational.AbstractFactory',
  'design-patterns-builder': 'DesignPatterns.Creational.Builder',
  'design-patterns-factory-method': 'DesignPatterns.Creational.FactoryMethod',
  'design-patterns-prototype': 'DesignPatterns.Creational.Prototype',
};

test('https en zonder www, als eerste regel', () => {
  const firstRule = htaccess.indexOf('RewriteRule');
  assert.ok(htaccess.indexOf('RewriteCond %{HTTPS} !=on [OR]') < firstRule);
  assert.ok(htaccess.indexOf('RewriteCond %{HTTP_HOST} ^www\. [NC]') < firstRule);
  assert.ok(htaccess.includes('RewriteRule ^ https://mvesign.com%{REQUEST_URI} [R=301,L]'));
});

test('de twee notities krijgen een redirect naar /notes/, en die pagina\'s bestaan', async () => {
  assert.ok(htaccess.includes('RewriteRule ^article/(sonarqube-serialization-pattern|dotnetcore-cancellation-tokens)/?$ https://mvesign.com/notes/$1/ [R=301,L]'));
  for (const slug of ['sonarqube-serialization-pattern', 'dotnetcore-cancellation-tokens']) {
    assert.ok(await existsInDist(`notes/${slug}/index.html`), slug);
  }
});

test('elk vervallen artikel wijst naar zijn code in design-patterns', () => {
  for (const [slug, folder] of Object.entries(DESIGN_PATTERNS)) {
    assert.ok(
      htaccess.includes(`RewriteRule ^article/${slug}/?$ https://github.com/mvesign/design-patterns/tree/main/${folder} [R=301,L]`),
      slug,
    );
  }
});

test('tags gaan naar /notes/, en die pagina bestaat', async () => {
  assert.ok(htaccess.includes('RewriteRule ^tag/ https://mvesign.com/notes/ [R=301,L]'));
  assert.ok(await existsInDist('notes/index.html'));
});

test('de foutpagina en de cache', async () => {
  assert.ok(htaccess.includes('ErrorDocument 404 /404.html'));
  assert.ok(await existsInDist('404.html'));
  assert.ok(htaccess.includes('Header set Cache-Control "no-cache"'));
  const assets = await readDist('_astro/.htaccess');
  assert.ok(assets.includes('Header set Cache-Control "public, max-age=31536000, immutable"'));
});
