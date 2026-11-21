# mvesign-web-www

De website [mvesign.com](https://mvesign.com): notities, projecten en een pagina over mij. Astro bouwt er statische HTML van; GitHub Actions zet die via FTPS op de webhosting bij mijn.host. Op de pagina's staat geen JavaScript.

Het ontwerp en de redenen staan in [de spec](docs/superpowers/specs/2026-11-21-website-design.md).

## Lokaal werken

Je hebt Node 26 nodig (zie `.nvmrc`); Astro weigert lager dan 22.23.4.

```powershell
npm ci
npm run dev
```

`npm run dev` geeft een voorbeeld op `http://localhost:4321` dat bijwerkt terwijl je typt. Wat er online komt, zie je met `npm run build` en `npm run preview`. Testen: `npm run check`, `npm run build` en `npm test` (de tests lezen `dist/`).

## Een notitie schrijven

Maak `src/content/notes/<slug>.md`. De bestandsnaam wordt de URL: `/notes/<slug>/`.

```markdown
---
title: Titel van de notitie
description: Eén zin voor Google en de LinkedIn-preview, hooguit 200 tekens.
date: 2026-11-21
tags: [dotnet]
source: https://github.com/mvesign/<repo>   # optioneel: de code bij de notitie
---
De tekst, in markdown. Een afbeelding zet je in src/content/notes/<slug>/ en je verwijst er relatief naar.
```

Mist een veld of klopt het type niet, dan faalt de build met een melding over het bestand en het veld. Een concept is een branch of een PR.

## Een project toevoegen

Maak `src/content/projects/<slug>.md` met `title`, `description`, `year`, `stack` (een lijst) en, bij een openbaar repo, `repo`. De tekst eronder: wat het is, waarom, en wat er interessant aan is.

## Publiceren

Merge naar `main`. De workflow `Site` bouwt, test en zet de site op mijn.host; na ongeveer een minuut staat hij online. Bij een PR bouwt en test hij alleen.

- **Handmatig uitrollen:** Actions → Site → *Run workflow* op `main`. Met `dry_run` aan zie je alleen wat er zou veranderen.
- **Automatisch uitrollen** staat aan zolang de repo-variabele `DEPLOY_ENABLED` `true` is (Settings → Secrets and variables → Actions → Variables).
- **Inloggegevens:** de omgeving `mijn-host` (Settings → Environments), alleen voor `main`, met `FTP_SERVER`, `FTP_USERNAME` en `FTP_PASSWORD`. Het FTP-account kan alleen bij `public_html` van mvesign.com.

## Updates

Renovate opent elke maandag één PR met de kleine updates (Astro, Node, de actions, de huisstijl). Een major komt pas na akkoord in het Dependency Dashboard. Een nieuwe versie van `mvesign-brand-assets` kan de opmaak veranderen: bekijk de site lokaal voordat je merget.

## Terugdraaien

Revert de commit op `main`; de workflow zet de vorige versie terug. Is de hosting zelf kapot, zet dan in DirectAdmin de back-up van `public_html` terug.
