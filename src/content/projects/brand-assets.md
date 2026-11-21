---
title: Huisstijlpakket
description: Eén pakket met de kleuren, het lettertype en het logo van mvesign, dat de home server en deze site als vaste versie gebruiken.
year: 2026
stack: [Node.js, resvg, Docker, GitHub Actions, Renovate]
repo: https://github.com/mvesign/mvesign-brand-assets
---
De huisstijl van mvesign staat op één plek. Een JSON-bestand met de kleuren is de bron. Een Node-script zonder dependencies maakt daaruit CSS-variabelen, een JSON-versie voor templates, de favicon en het woordmerk als SVG, en PNG-iconen.

Elke kleur heeft een waarde voor licht en voor donker, en een test controleert dat tekst overal het contrast van WCAG AA haalt. De letters in het logo zijn omgezet naar paden, zodat je geen lettertype nodig hebt om het te tonen.

Een release is een Docker-image zonder besturingssysteem, met alleen de bestanden. De home server pakt dat uit; [deze site](/projects/website/) gebruikt het als npm-pakket. Een nieuwe versie komt overal binnen als Renovate-PR, en gaat dus nooit ongezien live.
