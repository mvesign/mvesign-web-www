---
title: Home server als GitOps-repo
description: 'Een Ubuntu-server met tien Docker Compose-stacks, volledig beschreven in Git. Eén commando haalt main op, controleert de host en rolt uit. Met monitoring, runbooks en CI.'
year: 2026
stack: [Ubuntu Server, Docker Compose, Traefik, WireGuard, Gatus, Bash, Renovate]
---
## Uitgangspunt

Thuis draait een server met Ubuntu Server en Docker Compose. Alles wat erop staat, staat in één Git-repo: de compose-files, de configuratie van de host, de monitoring en de documentatie. Secrets en data staan buiten Git. De repo beschrijft de hele server, zodat ik hem vanaf een lege schijf opnieuw kan opbouwen.

Het repo is privé, omdat het mijn eigen netwerk beschrijft. Deze pagina gaat over de opbouw en de keuzes, niet over adressen of instellingen.

## Wat erop draait

Tien stacks, samen 21 containers:

- Traefik als reverse proxy, met een wildcard-certificaat van Let's Encrypt;
- AdGuard Home voor DNS en het blokkeren van advertenties;
- Nextcloud, met een eigen image (het officiële plus ffmpeg), een cron-container, PostgreSQL en Redis;
- Paperless-ngx, met PostgreSQL, Redis, Tika en Gotenberg;
- Home Assistant, met een Matter-server;
- een eigen nieuwsapp in Python, die elk uur RSS-feeds ophaalt, op titel filtert en elke ochtend een overzicht mailt;
- Gatus voor de monitoring, Scrutiny voor de SMART-historie van de schijven en Homepage als dashboard;
- een Postfix-relay, de enige plek die de gegevens van de mailbox kent.

Op de host zelf draaien WireGuard en een paar systemd-units. Van buitenaf kom je er alleen via de VPN bij.

## Pull, niet push

De CI heeft geen toegang tot de server en rolt niets uit. Valt de CI weg, dan merkt de server daar niets van. De server haalt `main` zelf op, met één commando:

```sh
sudo scripts/configure-host.sh --pull --check --deploy
```

- **`--pull`** doet `git pull --ff-only` als gewone gebruiker en weigert een detached HEAD. Daarna start het script zijn eigen nieuwe versie opnieuw (`exec`), zodat ook een optie die met deze pull binnenkomt meteen werkt.
- **`--check`** loopt 14 stappen voor de host langs. Elke stap is een eigen script dat je vaak kunt draaien zonder dat er iets verandert: pakketten, Docker en logrotatie, het datavolume, de Docker-netwerken, WireGuard, beveiligingsupdates en de bewaking van de schijven. Wijkt de host af van de repo, of faalt een stap, dan wordt er niets uitgerold.
- **`--deploy`** rolt de stacks uit in een vaste volgorde: Traefik eerst en Gatus als laatste, omdat Gatus de rest controleert. Per stack haalt het de images op (of bouwt het een eigen image met `--pull`), en `up -d --remove-orphans` maakt alleen de containers met een nieuw image of nieuwe configuratie opnieuw aan.

## Vangrails bij de uitrol

Het uitrolscript vergelijkt de major-versie die draait met die in de repo. Een nieuwe major van PostgreSQL stopt de uitrol altijd, want die start niet op een bestaande datamap. Dat kan alleen met een dump en een restore, en dat doe ik met de hand. Bij Nextcloud vraagt het script of er een back-up is gemaakt, en het weigert een sprong van meer dan één major, omdat Nextcloud dat zelf ook niet toestaat.

Terugdraaien is een revert in Git, plus de back-up van die app. Hoe dat per app gaat, staat in de documentatie.

## Netwerk en beveiliging

- **Een certificaat zonder open poort.** Let's Encrypt via de DNS-01-challenge. Het challenge-record is met een CNAME doorgezet naar een aparte zone, en het token op de server mag alleen dat ene TXT-record schrijven.
- **TLS en security headers op het entrypoint**, niet per router, zodat een nieuwe service ze niet kan vergeten. Er staan HSTS, `nosniff` en `Referrer-Policy: same-origin` in. Het strengere `no-referrer` breekt het inloggen bij Paperless, omdat Django bij de CSRF-controle naar de referrer kijkt.
- **Traefik routeert alleen wat zich aanmeldt** (`exposedbydefault=false`).
- **Netwerken per functie.** Er is een gedeeld netwerk voor de proxy en per stack een intern netwerk voor de database. In een intern mailnetwerk kan alleen de relay naar buiten. Homepage ziet Docker alleen via een socket-proxy die uitsluitend lezen toestaat.
- **Containers met zo min mogelijk rechten**, zoals de nieuwsapp: een read-only filesystem, `no-new-privileges`, `cap_drop: ALL` en geen root. Scrutiny krijgt alleen `SYS_RAWIO`.
- **Eén PostgreSQL per stack**, nooit gedeeld.
- **WireGuard op de host**, als split tunnel die alleen de server bereikt.
- **Beveiligingsupdates** dagelijks via unattended-upgrades, zonder automatische herstart. Docker werk ik met de hand bij, omdat een update alle containers herstart.

## Monitoring

Gatus doet 14 checks, elk kwartier: HTTP met voorwaarden op de JSON in het antwoord, DNS, TCP, de status van WireGuard en de geldigheid van het certificaat. Bij minder dan 21 dagen komt er een mail. De HTTP-checks lopen via Traefik, dus één check test de proxy, het certificaat en de service samen. Een mail komt pas na twee mislukte checks op rij, zodat een herstart tijdens een uitrol geen vals alarm geeft.

De schijven bewaakt smartd, en Scrutiny toont de historie. Logs van containers roteren, zodat ze de schijf niet vol laten lopen.

## Documentatie als runbook

Elk van de twaalf componenten heeft een map met drie documenten:

- `README.md` beschrijft het opbouwen, van wat je nodig hebt tot een controle aan het eind;
- `BEHEER.md` beschrijft wat je terugkerend doet, zoals een major-upgrade van Nextcloud;
- `TROUBLESHOOT.md` geeft per probleem het symptoom zoals je het ziet, met de oorzaak en de oplossing.

Opdrachten in de documentatie moeten letterlijk te plakken zijn. Een script controleert daarom elk bash-blok op syntax en op een `<placeholder>`, omdat bash dat als redirect uitvoert. Vanaf een lege schijf zijn het vier basisstappen, en daarna de twaalf componenten in een vaste volgorde, elk met een controle aan het eind.

## CI op elke wijziging

Elke push en pull request draait op Ubuntu 24.04, net als de server, met dezelfde versie van Docker Compose (vastgezet en gecontroleerd met SHA-256). De pipeline controleert:

- elke stack met `docker compose config`;
- de YAML-syntax;
- de bash-blokken in de documentatie;
- de scripts met ShellCheck;
- de Python-syntax;
- de 101 unit tests van de nieuwsapp, in een eigen container;
- de hele repo met gitleaks, op secrets die er niet in horen.

Renovate stelt elke maandag één PR voor met alle kleine updates, en een major wacht op akkoord. Images krijgen een digest naast de tag. Drie regex-regels houden versies bij die Renovate anders niet vindt, zoals de `FROM`-regel van het eigen Nextcloud-image. Bij updates van PostgreSQL, Nextcloud en Paperless zet Renovate een waarschuwing in de PR. Mergen doe ik zelf.

## Keuzes

- **Compose, geen Kubernetes.** Voor één machine is Compose genoeg. Proxmox viel ook af: de instellingen staan dan buiten Git, en het netwerk krijgt een extra laag.
- **Bash voor de configuratie van de host.** Dat is genoeg voor deze omvang. Groeit het, dan is `ansible-pull` de volgende stap.
- **Gatus, geen Uptime Kuma.** Bij Gatus zijn de checks configuratie in Git, geen klikwerk in een webinterface.
- **WireGuard op de host.** Op de router gaat de configuratie verloren bij een andere router. Tailscale vraagt een account en een coördinatieserver van derden. Headscale moet zelf vanaf internet bereikbaar zijn, en wg-easy zet de apparaten in een webinterface in plaats van in Git.
- **Mappen koppelen, geen losse bestanden.** Git vervangt een bestand bij een pull door een nieuw bestand, en een koppeling van één bestand blijft dan de oude versie tonen.
- **De hash van het script in de systemd-unit.** Een eigen unit bevat de SHA-256 van zijn script. Verandert het script, dan verandert de unit, en wordt de service herstart.
- **Geen provenance op eigen images.** Anders krijgt elke build een andere digest, en maakt elke uitrol de containers opnieuw aan.
