---
title: mvesign.com
description: 'Deze site: Astro bouwt statische HTML zonder JavaScript, tests controleren de gebouwde uitvoer, en GitHub Actions zet hem via SFTP met een vaste hostkey op de webhosting.'
year: 2026
stack: [Astro, TypeScript, Node.js, GitHub Actions, lftp, LiteSpeed, Renovate]
repo: https://github.com/mvesign/mvesign-web-www
---
## Waarom opnieuw

De vorige versie was een Svelte-app die alles in de browser opbouwde. De `<body>` was leeg, er was geen `<title>`, en de browser laadde 1,1 MB JavaScript om een artikel te tonen. De artikelen kwamen als markdown uit een PHP-API, met drie losse repo's erachter. Zoekmachines en de previews van LinkedIn zagen een lege pagina.

Nu is het één openbaar repo met de code en de inhoud samen. Op de webhosting draait geen code meer, alleen bestanden. Een notitie publiceren is een push naar `main`.

## Inhoud als data

Een notitie of een project is een markdown-bestand in een content collection van Astro. Het schema is een `z.strictObject`: een veld dat ontbreekt, een verkeerd type of een veld dat er niet hoort, laat de build falen. De beschrijving mag hooguit 200 tekens zijn, omdat die in de lijst, bij Google en in de LinkedIn-preview staat.

```ts
schema: z.strictObject({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  year: z.number().int(),
  stack: z.array(z.string().min(1)).min(1),
  repo: z.url().optional(),
}),
```

Astro maakt van elke pagina een map met een `index.html`, met een canonical URL, Open Graph-tags en een plek in de sitemap. Codeblokken kleurt Shiki tijdens het bouwen, met een licht en een donker thema. Welk thema je ziet, regelt CSS met `prefers-color-scheme`, dus er komt geen highlighter in de browser.

## Geen JavaScript, en dat is getest

De tests draaien met `node:test` op de gebouwde `dist/`, niet op de broncode. Zo test ik wat de bezoeker echt krijgt:

- elke pagina heeft `lang="nl"` en bevat geen `<script>`;
- elke interne `href` en `src` wijst naar een bestand dat bestaat;
- de deelafbeelding is 1200 × 630 pixels, gelezen uit de IHDR-header van de PNG;
- het webmanifest verwijst naar iconen die echt 192 en 512 pixels zijn;
- de redirects en cache-headers staan in `.htaccess`, en hun doelen bestaan;
- de pagina over de [home server](/projects/home-server/) bevat geen IP-adres, mailbox of interne domeinnaam.

Daarvoor controleert `astro check` de types en de schema's.

## De deelafbeelding

De afbeelding voor LinkedIn ontstaat tijdens het bouwen. Een endpoint maakt een SVG met de kleuren en het woordmerk uit het [huisstijlpakket](/projects/brand-assets/), en resvg (als WebAssembly) zet die om naar een PNG. Het woordmerk bestaat uit paden, dus resvg heeft geen lettertype nodig.

Een afbeelding per notitie, met de titel erin, viel af. Daarvoor is het lettertype als TTF nodig, en het huisstijlpakket levert alleen woff2. LinkedIn toont de titel toch al naast de afbeelding.

## Uitrol in drie rondes

GitHub Actions bouwt en test bij elke push en pull request. Op `main` gaat `dist/` als artifact naar een tweede job, die het met lftp via SFTP op de webhosting zet. Die job draait met `concurrency`: er loopt hooguit één upload tegelijk, en een lopende upload wordt niet afgebroken.

De bestanden in `_astro/` hebben een hash in hun naam. Daarom gaat de upload in drie rondes (ingekort):

```sh
# 1. de nieuwe assets erbij
mirror --reverse dist/_astro _astro
# 2. de HTML en de rest; weg wat niet meer in dist/ staat
mirror --reverse --delete --exclude-glob _astro/ \
  --exclude-glob .well-known/ --exclude-glob cgi-bin/ dist/ .
# 3. de oude assets weg
mirror --reverse --delete dist/_astro _astro
```

Zo verwijst de HTML nooit naar een asset dat er nog niet of niet meer is, ook niet halverwege een upload. `.well-known/` (het certificaat) en `cgi-bin/` van het hostingpanel blijven staan.

## Een upload die niet te veel kan verwijderen

`--delete` op de verkeerde map is gevaarlijk. Het account waarmee de workflow inlogt, is een FTP-account dat alleen bij de websitemap kan. Toch controleert de workflow eerst de map waarin hij na het inloggen staat. Ziet hij mappen van het hele hostingaccount (`domains`, `mail`, `.ssh`), of ontbreekt `index.html`, dan stopt hij voordat er iets is geüpload of verwijderd. Dat geldt ook voor een proefrun.

Een push naar `main` rolt pas uit als de repo-variabele `DEPLOY_ENABLED` aan staat. Handmatig starten kan altijd, ook als proefrun met `mirror --dry-run`. Na de upload volgt een rooktest met curl: de home moet 200 geven en een `<title>` hebben, en een oude URL moet een 301 naar het nieuwe adres geven.

## Waarom SFTP en niet FTPS

Het plan was FTPS. Bij de eerste proefrun weigerde lftp het certificaat, en terecht: de FTP-server stuurt zijn certificaat zonder het tussencertificaat van Let's Encrypt. SFTP heeft geen certificaatketen nodig. De hostkey van de server staat vast in de workflow, met `StrictHostKeyChecking=yes`. Verandert die sleutel, dan stopt ssh en gaat er niets live. Het wachtwoord gaat via een omgevingsvariabele naar lftp, zodat het niet in een script of op de opdrachtregel staat.

Rsync over SSH viel ook af. Een SSH-sleutel van het hoofdaccount kan bij het hele hostingaccount, ook bij de mail. Het FTP-account kan alleen bij de site, ook via SFTP.

## Cache en oude URL's

HTML krijgt `Cache-Control: no-cache`, zodat een nieuwe notitie meteen zichtbaar is. De bestanden in `_astro/` krijgen een jaar en `immutable`: verandert de inhoud, dan verandert de naam. De `.htaccess` stuurt alles naar https zonder www en geeft de oude URL's een 301. De twee artikelen die notities werden, gaan naar hun nieuwe adres. De tien vervallen artikelen over design patterns gaan naar hun code op GitHub.

## Onderhoud

Alle GitHub Actions staan vast op een commit-SHA, met de versie als commentaar, en de workflow heeft alleen `contents: read`. Renovate bundelt kleine updates in één PR per week, en een major wacht op akkoord. Een nieuwe versie van het huisstijlpakket krijgt een notitie in de PR: eerst lokaal bekijken, want na de merge staat hij meteen live.
