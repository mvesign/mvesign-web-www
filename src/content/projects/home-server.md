---
title: Home server als GitOps-repo
description: Een Ubuntu-server met Docker Compose waarvan Git de enige bron van waarheid is. De server haalt zelf zijn configuratie op, en Renovate stelt elke week de updates voor.
year: 2026
stack: [Ubuntu Server, Docker Compose, Traefik, WireGuard, Renovate]
---
Thuis draait een server met Ubuntu Server en Docker Compose. Alles wat erop staat, staat in één Git-repo: de server haalt zelf `main` op en past de wijzigingen toe. Secrets en data staan buiten Git.

Op de server draaien onder meer Traefik met een wildcard-certificaat van Let's Encrypt, AdGuard, Nextcloud, Paperless, Home Assistant, een eigen nieuwsapp en Gatus voor de monitoring. Van buitenaf kom je er alleen via WireGuard bij.

Elk onderdeel heeft een eigen map met drie documenten: hoe je het opbouwt, wat je terugkerend doet en hoe je problemen oplost. Daarmee bouw ik de server vanaf een lege schijf opnieuw op. Renovate stelt elke week de updates voor; die merge ik zelf.

Het repo is privé, omdat het mijn eigen netwerk beschrijft.
