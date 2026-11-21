---
title: mvesign.com
description: 'Deze site: Astro bouwt bij elke push kant-en-klare HTML, en GitHub Actions zet die via FTPS op de webhosting. Geen JavaScript en geen backend.'
year: 2026
stack: [Astro, GitHub Actions, LiteSpeed]
repo: https://github.com/mvesign/mvesign-web-www
---
Deze site was eerst een Svelte-app die alles in de browser opbouwde, met een PHP-API en drie losse repo's erachter. Zoekmachines en LinkedIn zagen een lege pagina.

Nu is het één repo. Een notitie is een markdown-bestand; Astro controleert de gegevens en maakt bij het bouwen alle pagina's, met de meta-tags voor delen. GitHub Actions bouwt bij elke push en zet de site via FTPS op de webhosting, met een account dat alleen bij de site kan. Op de pagina's staat geen JavaScript.

De kleuren, het lettertype en het logo komen uit het [huisstijlpakket](/projects/brand-assets/).
