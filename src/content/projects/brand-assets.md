---
title: Huisstijlpakket
description: 'De kleuren, het lettertype en het logo van mvesign als één versie: een Node-generator met contrasttests, uitgebracht als image FROM scratch en als Git-dependency.'
year: 2026
stack: [Node.js, resvg-wasm, fontTools, Docker, GitHub Actions, Renovate]
repo: https://github.com/mvesign/mvesign-brand-assets
---
## Waarom een pakket

De huisstijl komt op meer plekken terug: op [deze site](/projects/website/) en in de apps op de [home server](/projects/home-server/). Daarom staat hij op één plek, met een versienummer. Een afnemer zet een versie vast, en een nieuwe versie komt binnen als pull request die je eerst bekijkt. Een nieuwe huisstijl gaat dus nooit ongezien live.

## Rollen, geen palet

De bron is `src/tokens.json`. Daarin staan geen losse kleuren, maar 16 rollen, zoals `text`, `link`, `bar` en `on_bar`, elk met een waarde voor licht en voor donker. Een onderdeel vraagt dus om de kleur van een link, niet om blauw.

```json
"link": { "light": "#0376A2", "dark": "#5DB4DC" },
"bar":  { "light": "#0376A2", "dark": "#035A88" },
```

Daarnaast staan er het lettertype, vier gewichten, vier groottes, de hoekafronding en de dikte van de rand onder de balk in. De validatie is streng: precies de verwachte sleutels, kleuren als `#RRGGBB` in hoofdletters, namen in snake_case en groottes in px. Een fout in de bron stopt de generator.

## Eén CSS-bestand, drie manieren om te schakelen

`tokens.css` geeft elke rol drie keer: vast licht, vast donker en de actieve waarde, zoals `--mv-link`. Die volgt de systeeminstelling, tenzij `data-theme` op `<html>` een keuze vastzet:

```css
:root { --mv-link: var(--mv-light-link); }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --mv-link: var(--mv-dark-link); }
}

:root[data-theme="dark"] { --mv-link: var(--mv-dark-link); }
```

Elke kleur bestaat ook als RGB-kanalen, zoals `--mv-light-link-rgb: 3 118 162`. Die zijn er voor apps die hun eigen palet bouwen en het thema met een class wisselen, zoals Homepage.

Naast de CSS komen er een `tokens.json` voor templates, met sleutels in snake_case zodat Jinja2 ze zonder haakjes leest, en een `fonts.css` met Open Sans als variabel lettertype (gewicht 300 tot 800). Dat lettertype staat in het pakket zelf, verdeeld over latin en latin-ext met `unicode-range`. Er komt dus geen Google Fonts aan te pas.

## Een generator zonder framework

`scripts/generate.mjs` leegt `dist/` en schrijft alles opnieuw. De pure functies staan in `scripts/lib/` en zijn los getest. Style Dictionary viel af: een grote dependency voor 16 kleuren, terwijl licht en donker en de RGB-kanalen toch eigen configuratie vragen. Een Python-script viel ook af, omdat de PNG's dan cairo als systeembibliotheek vragen.

De enige devDependency is `@resvg/resvg-wasm`, voor de PNG's. Ik koos bewust de WebAssembly-versie, omdat die op Windows en Linux dezelfde bytes geeft. Dat is nodig, want `dist/` staat in Git, en de CI bouwt opnieuw en faalt bij elk verschil:

```sh
npm run generate
if [ -n "$(git status --porcelain)" ]; then
  echo "::error::dist/ klopt niet met de bron."
  exit 1
fi
```

Alle bestanden hebben LF als regeleinde (`.gitattributes`). Anders zou die vergelijking op Windows nooit kloppen.

De iconen komen uit SVG-sjablonen met verwijzingen als `{{color.light.bar}}`. Een onbekende verwijzing is een fout, geen lege kleur. De apple-touch-icon heeft geen afgeronde hoeken: iOS rondt ze zelf af, en maakt een transparante hoek zwart.

## Letters als paden

Het woordmerk en de favicon bevatten geen tekst, alleen paden. Zo ziet het logo er overal hetzelfde uit, ook zonder Open Sans, en kan resvg het renderen zonder lettertype. Een Python-script met fontTools maakt een instantie van het variabele lettertype op gewicht 800 en schrijft de letters als SVG-paden. Dat gebeurt één keer, niet bij elke build. De `m` en de `v` staan in een eigen groep, zodat deze site ze bij hover goud kan kleuren.

## Contrast als test

Het pakket heeft 63 tests met `node:test`. Er zijn er 27 voor het contrast volgens WCAG 2: de relatieve luminantie van beide kleuren, en minstens 4,5:1 voor 13 combinaties van tekst en achtergrond, in licht en in donker. De eerste is een ijkpunt: zwart op wit moet 21:1 geven. De accentkleur is bewust nooit een tekstkleur (1,8:1 op wit) en staat dus niet in de lijst.

De andere tests controleren onder meer:

- de validatie van de bron, met de volledige verwachte CSS en JSON voor een kleine voorbeeldbron;
- de exacte lijst bestanden in `dist/` en de afmetingen van elke PNG;
- dat dezelfde SVG twee keer dezelfde PNG-bytes geeft;
- dat `package.json` geen `build`-, `prepare`- of `postinstall`-script heeft.

## Uitbrengen

Een release begint met een tag als `v1.0.0`. De workflow controleert dat de tag, de versie in `package.json` en een kop in `CHANGELOG.md` overeenkomen. Bestaat die versie al, dan stopt hij: een versie wordt één keer gebouwd en verandert daarna nooit.

Het image is zo klein als het kan:

```dockerfile
FROM scratch
COPY dist/ /brand/
```

Er zit geen besturingssysteem en geen `CMD` in: de container draait nooit. Het image staat op ghcr.io voor amd64 en arm64, alleen met een exacte versie en zonder `latest`. Provenance en SBOM staan uit, omdat provenance tijdstippen bevat: elke build zou dan een andere digest krijgen. De workflow zet de verwijzing met digest in de samenvatting van de run, klaar voor de server.

## Twee afnemers, twee routes

Deze site neemt het pakket op als Git-dependency op een tag: `github:mvesign/mvesign-brand-assets#v1.0.0`. Het pakket is `private` en staat dus niet op npm. Omdat het geen build-script heeft, bouwt npm bij het installeren niets, en door `files` komt alleen `dist/` mee. De site importeert de CSS en het woordmerk, en gebruikt de kleuren uit `tokens.json` voor de deelafbeelding.

De home server haalt het image op met tag en digest, maakt er een container van zonder die te starten, en kopieert `/brand` naar een map die de apps alleen-lezen koppelen. Een image mount in Compose viel af: die komt na een herstart van de host leeg terug ([moby/moby#50999](https://github.com/moby/moby/issues/50999)).

In beide repo's maakt Renovate een PR voor een nieuwe versie. Op de server doet een regex-regel dat, die de tag en de digest samen bijwerkt.
