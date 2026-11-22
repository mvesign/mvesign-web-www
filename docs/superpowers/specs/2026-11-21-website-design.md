# mvesign-web-www: ontwerp

Datum: 21 november 2026. Status: ontwerp, akkoord per onderdeel in de brainstorm; de spec zelf wacht op akkoord.

## Doel

mvesign.com wordt een werkplaats: een portfolio met korte notities, projecten en een pagina over mij. Een notitie publiceren is een push naar `main`. Daarna bouwt GitHub de site en zet hem op mijn.host. Op mijn.host hoef je na de eerste inrichting niets meer te doen.

De site vervangt vier repo's en een API door één openbaar repo. Elke pagina is kant-en-klare HTML met meta-tags, zodat Google en LinkedIn-previews werken.

## Wat er nu is

| Onderdeel | Wat het doet | Probleem |
|---|---|---|
| mvesign.com | Svelte-app (Rollup, geen SvelteKit), Bootstrap, FontAwesome, highlight.js, Buy Me a Coffee-widget | De `<body>` is leeg en er is geen `<title>`; de browser bouwt alles op met 1,1 MB JavaScript. Zoekmachines en LinkedIn zien een lege pagina. |
| `api.mvesign.com` | PHP, geeft per artikel JSON met de markdown | Openbaar, zonder key, met `Access-Control-Allow-Origin: *` |
| `mvesign-web-articles` | Privé repo met `overview.json` en de artikelen | Privé beschermt niets: de API geeft alles openbaar terug |
| `mvesign-web-frontend` / `mvesign-web-www` | De frontend; welke van de twee live staat, is niet bekend | — |
| `mvesign-web-images` | Bedoeld voor afbeeldingen | Bevat alleen `test-image.jpg` |
| Hosting | Webhosting bij mijn.host: LiteSpeed, DirectAdmin, PHP, SFTP/FTPS, SSH op poort 26 (standaard uit) | — |

## Vaste keuzes (uit de brainstorm van 21 november)

Deze keuzes staan vast en worden hier niet opnieuw afgewogen:

- **Aanpak A:** statisch bouwen in GitHub Actions en uploaden naar mijn.host. Op mijn.host draait geen code, alleen bestanden.
- **Eén openbaar repo**, `mvesign-web-www`, met de code en de inhoud samen.
- **Astro** als generator.
- **Taal:** de techniek is Engels (code, bestandsnamen, URL's, schemavelden, commitberichten). Alles wat de lezer ziet, is Nederlands. De README is Nederlands, net als in de andere repo's.
- **Onderdelen:** Notities, Projecten en Over mij. Een log komt later.
- **Huisstijl:** `mvesign-brand-assets`, variant A, als npm-pakket.
- **Oude artikelen:** twee blijven en worden vertaald, tien vervallen (zie *Overstap*).
- **Upload:** SFTP (poort 22) met een eigen FTP-account dat alleen bij `public_html` kan. (Eerst FTPS; gewijzigd op 22 november 2026, zie *Beslissingen*.)
- **Geen** JavaScript in de pagina's, geen analytics, geen cookies en geen scripts van derden.
- **De oude repo's** (`-articles`, `-api`, `-frontend`, `-images` en een eventueel oud `-www`) mogen weg.

## Beslissingen

| Onderwerp | Keuze | Reden |
|---|---|---|
| Tekst van een project | Zelf geschreven in markdown, niet uit de README gehaald | Een README is vaak een installatiehandleiding, soms Nederlands of privé, en ophalen maakt de GitHub-API een afhankelijkheid van de build |
| Concepten | Een branch of PR; geen veld `draft` | Git heeft dat al |
| Tags | Alleen als label bij een notitie, zonder eigen pagina | Twee notities; een pagina per tag voegt niets toe |
| Deelafbeelding | Eén voor de hele site, gemaakt bij de build | Een afbeelding per notitie met de titel vraagt Open Sans als TTF, en de huisstijl levert alleen woff2. LinkedIn toont de titel toch al naast de afbeelding. |
| Licht en donker | Volgt de systeeminstelling, geen knop | Geen JavaScript nodig; `tokens.css` regelt het |
| Upload | SFTP met het FTP-account; niet SSH met rsync en niet FTPS | Een SSH-sleutel van het hoofdaccount geeft toegang tot het hele hostingaccount, ook de mail; het FTP-account kan alleen bij de site, ook via SFTP. FTPS viel af bij de eerste proefrun: de FTP-server van mijn.host stuurt zijn certificaat zonder tussencertificaat (Let's Encrypt YE1), dus lftp weigert het terecht. SFTP heeft geen certificaatketen nodig (de sleutel van de server staat vast in de workflow), en mijn.host raadt het zelf aan. |
| Updates | Renovate, één PR per week, die je zelf merget | Een update die de opmaak verandert, gaat niet ongezien live |
| Twitter en Buy Me a Coffee | Weg | De widget laadt een script van een derde partij en past niet bij een showcase; Twitter wordt niet meer gebruikt (aanname) |
| Licentie | De code onder MIT; de teksten in `src/content/` en `src/pages/about.md` alle rechten voorbehouden | Code vrij, de teksten niet. Het woordmerk en de favicon vallen onder de licentie van `mvesign-brand-assets`. |

## Repo

```
src/content.config.ts          de schema's van de collecties
src/content/notes/<slug>.md    een notitie
src/content/notes/<slug>/      afbeeldingen bij die notitie (alleen als nodig)
src/content/projects/<slug>.md een project
src/layouts/Base.astro         <head>, de balk, de footer
src/components/*.astro         onderdelen, zoals Meta en Wordmark
src/lib/*.ts                   hulpfuncties, zoals de datumnotatie
src/pages/index.astro          home
src/pages/notes/               lijst en notitie
src/pages/projects/            lijst en project
src/pages/about.md             Over mij
src/pages/404.astro            de foutpagina
src/pages/rss.xml.ts           de feed
src/pages/og-default.png.ts    de deelafbeelding
src/pages/site.webmanifest.ts  het webmanifest
public/.htaccess               redirects, foutpagina, cache
public/robots.txt              met een verwijzing naar de sitemap
test/*.test.mjs                controles op dist/ (node --test)
astro.config.mjs
package.json, package-lock.json, .nvmrc
.github/workflows/site.yml
renovate.json, .gitattributes, .gitignore
README.md, LICENSE
docs/superpowers/              spec en plan
```

- **`package.json`:** `"name": "mvesign-web-www"`, `"private": true`, `"type": "module"`. Scripts: `dev`, `build`, `preview`, `check` (`astro check`) en `test` (`node --test test/`).
  - Dependencies: `astro`, `@astrojs/rss`, `@astrojs/sitemap` en `"mvesign-brand-assets": "github:mvesign/mvesign-brand-assets#v1.0.0"`.
  - DevDependencies: `@astrojs/check`, `typescript` en `@resvg/resvg-wasm`.
- **Versies bij het schrijven:** `astro` 7.4.13 (vraagt Node 22.23.4 of hoger), `@astrojs/rss` 4.0.19, `@astrojs/sitemap` 3.7.6.
- **`.nvmrc`:** `26`, de actuele LTS-versie (26.13.1, "Lithium"). Lokaal draait nu 22.23.2; die moet naar 26.
- **`.gitattributes`:** `* text=auto eol=lf`; `*.png`, `*.jpg` en `*.woff2` zijn binair.
- **`.gitignore`:** `node_modules/`, `dist/`, `.astro/`.
- **`astro.config.mjs`:** `site: "https://mvesign.com"`, `trailingSlash: "always"`, `build.format: "directory"`, de integratie `@astrojs/sitemap`, en Shiki met een licht en een donker thema (`github-light` en `github-dark`).

## Inhoud

### Notities

Collectie `notes`, uit `src/content/notes/*.md`. Alleen dat niveau, zodat de mappen met afbeeldingen niet als notitie gelezen worden. De bestandsnaam is de slug.

| Veld | Type | Verplicht | Waarvoor |
|---|---|---|---|
| `title` | tekst | ja | De kop, `<title>` en `og:title` |
| `description` | tekst, hooguit 200 tekens | ja | Eén zin voor Google en de LinkedIn-preview |
| `date` | datum | ja | Volgorde en weergave |
| `tags` | lijst van tekst, minstens één | ja | Labels |
| `source` | URL | nee | Link naar de code op GitHub |

Een afbeelding staat in `src/content/notes/<slug>/` en de notitie verwijst er relatief naar (`./<slug>/schema.png`). Astro optimaliseert hem bij het bouwen.

### Projecten

Collectie `projects`, uit `src/content/projects/*.md`.

| Veld | Type | Verplicht | Waarvoor |
|---|---|---|---|
| `title` | tekst | ja | De kop, `<title>` en `og:title` |
| `description` | tekst, hooguit 200 tekens | ja | De lijst, Google en LinkedIn |
| `year` | geheel getal | ja | Volgorde en weergave |
| `stack` | lijst van tekst, minstens één | ja | De gebruikte techniek |
| `repo` | URL | nee | Alleen bij een openbaar repo |

De tekst onder de gegevens is een technische uitwerking van het project, verdeeld in `##`-secties: de aanleiding, de architectuur, de onderdelen die technisch het interessantst zijn, en de keuzes met de alternatieven die afvielen. Reken op 600 tot 1000 woorden, met korte code- of configuratiefragmenten waar die iets laten zien. Alles in de tekst is na te gaan in het repo. Bij een privé repo staan er geen adressen, accounts, netwerkdetails of code uit dat repo in. (Gewijzigd op 22 november 2026: eerst was de tekst kort.)

### Over mij

`src/pages/about.md`, een markdown-pagina met de layout. Wie je bent, je stack, je certificaten en links.

### Controle

De schema's staan in `src/content.config.ts`. Mist een verplicht veld of heeft een veld het verkeerde type, dan faalt de build met een melding die zegt welk bestand en welk veld.

## Pagina's

| Pad | Inhoud |
|---|---|
| `/` | Twee of drie zinnen over jou, hooguit vijf van de nieuwste notities en hooguit drie van de nieuwste projecten |
| `/notes/` | Alle notities, nieuwste eerst: datum, titel, beschrijving, tags |
| `/notes/<slug>/` | Titel, datum, tags en de tekst. Onderaan "Bekijk de code op GitHub" (als `source` is ingevuld) en "Bekijk deze pagina op GitHub" (naar `https://github.com/mvesign/mvesign-web-www/blob/main/src/content/notes/<slug>.md`) |
| `/projects/` | Alle projecten, nieuwste jaar eerst, daarna op titel: titel, jaar, stack, beschrijving |
| `/projects/<slug>/` | De tekst, met een link naar het repo als `repo` is ingevuld |
| `/about/` | Over mij |
| `/404.html` | "Pagina niet gevonden", met links naar home en de notities |
| `/rss.xml` | De notities: titel, beschrijving, datum en link; taal `nl-NL` |
| `/sitemap-index.xml` | Van `@astrojs/sitemap`, zonder de 404-pagina |
| `/og-default.png` | De deelafbeelding |
| `/site.webmanifest` | Het webmanifest |

- **Menu in de balk:** *Notities*, *Projecten*, *Over mij*.
- **Datums:** `Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" })`, dus "13 december 2022", in een `<time datetime="2022-12-13">`.
- **Footer:** GitHub (`https://github.com/mvesign`), LinkedIn (de URL geef je bij de bouw), Stack Overflow (`https://stackoverflow.com/users/11607650/mvesign`) en RSS.
- **Toegankelijkheid:** een link "Naar de inhoud" als eerste element, landmarks (`header`, `nav`, `main`, `footer`), zichtbare focus. Het contrast van de kleuren test de huisstijl al.

## Opmaak

- **De huisstijl:** `Base.astro` importeert `mvesign-brand-assets/fonts.css` en `mvesign-brand-assets/tokens.css`. Vite vindt de woff2-bestanden via de relatieve paden in `fonts.css`. Alle kleuren, het lettertype en de hoeken komen uit de `--mv-`-properties; de site definieert zelf geen kleuren.
- **De balk:** achtergrond `--mv-bar`, onderaan een rand van `--mv-bar-edge-width` in `--mv-bar-edge`.
  - Links het woordmerk: `wordmark.svg` als `?raw` geïmporteerd en rechtstreeks in de HTML gezet. Bij aanwijzen krijgt `.mv` de kleur `--mv-accent`.
  - Rechts het menu in `--mv-on-bar`.
- **Lezen:** één kolom van ongeveer 70 tekens breed, die ook op een telefoon past.
- **Code:** Shiki bij het bouwen, met beide thema's. CSS kiest het thema met `prefers-color-scheme`, net als `tokens.css`. Het lettertype is `--mv-font-mono`.
- **JavaScript:** geen. De build bevat geen `<script>`; een test bewaakt dat.

## `<head>` en delen

Op elke pagina:

- `<html lang="nl">`, `charset`, `viewport`, `<meta name="color-scheme" content="light dark">`;
- `<title>`: "mvesign" op home, anders "<titel> · mvesign";
- `description`, en `<link rel="canonical">` met de volledige URL;
- `og:title`, `og:description`, `og:url`, `og:type` (`article` bij een notitie, anders `website`), `og:locale` `nl_NL`, `og:site_name` `mvesign`;
- `og:image` (`https://mvesign.com/og-default.png`) met `og:image:width` 1200 en `og:image:height` 630;
- bij een notitie ook `article:published_time`;
- de favicon, de `apple-touch-icon`, het webmanifest, en een `<link rel="alternate" type="application/rss+xml">` naar `/rss.xml`.

Uitzondering: `404.html` heeft geen `canonical` en geen `og:url`, want die pagina heeft geen eigen adres. Wel `<meta name="robots" content="noindex">`.

**De deelafbeelding** (`og-default.png.ts`, bij de build gemaakt):

- Een SVG van 1200 × 630 met een vlak in `bar` (licht), onderaan een strook in `bar_edge` (licht), en het woordmerk in het midden, ongeveer 600 px breed.
- De kleuren komen uit `mvesign-brand-assets/tokens.json`, het woordmerk uit `logo/wordmark.svg`.
- Zet de SVG om naar PNG met `@resvg/resvg-wasm`. Het woordmerk bestaat uit paden, dus er is geen lettertype nodig.
- Bij een nieuwe versie van de huisstijl verandert de afbeelding vanzelf mee.

**Favicon en iconen:**

- `favicon.svg`, `apple-touch-icon.png`, `icon-192.png` en `icon-512.png` komen uit het pakket via een `?url`-import. Vite zet ze in `_astro/` met een hash in de naam. Er is geen kopieerstap.
- Dit beantwoordt het open punt in de spec van de huisstijl ("hoe, hangt af van de techniek").
- `site.webmanifest.ts` geeft `name` en `short_name` "mvesign", `icons` (192 en 512), `theme_color` (`bar`, licht), `background_color` (`bg`, licht) en `display` `browser`.

## `.htaccess`

LiteSpeed leest de Apache-regels in `.htaccess`. In deze volgorde:

1. **HTTPS en zonder www:** een verzoek over `http` of naar `www.mvesign.com` krijgt een 301 naar `https://mvesign.com` met hetzelfde pad.
2. **De twee notities:** `/article/sonarqube-serialization-pattern` en `/article/dotnetcore-cancellation-tokens` (met of zonder `/` aan het eind) krijgen een 301 naar `/notes/<slug>/`.
3. **De tien vervallen artikelen:** een 301 naar hun map in `design-patterns` (zie *Overstap*).
4. **Tags:** `/tag/...` krijgt een 301 naar `/notes/`.
5. **Foutpagina:** `ErrorDocument 404 /404.html`.
6. **Cache:**
   - bestanden in `/_astro/`: `Cache-Control: public, max-age=31536000, immutable`, omdat de naam verandert als de inhoud verandert;
   - HTML: `Cache-Control: no-cache`, zodat de browser bij elk bezoek controleert of er iets nieuws is.

   Welke vorm van de regel LiteSpeed accepteert, controleert het plan bij de eerste uitrol met `curl -I`.

## Bouwen en uitrollen

### Workflow `site.yml`

| Wanneer | Job | Stappen |
|---|---|---|
| Elke push en PR, en handmatig | `build` | Node volgens `.nvmrc`; `npm ci`; `npm run check`; `npm run build`; `npm test`. Bij een push naar `main` of handmatig: `dist/` als artifact bewaren. |
| Push naar `main` als de repo-variabele `DEPLOY_ENABLED` `true` is, en handmatig vanaf `main` | `deploy` | Na `build`. Het artifact ophalen, `lftp` installeren, de map van het account controleren, uploaden in drie rondes, daarna de rooktest. |

- **Rechten:** `contents: read`.
- **`DEPLOY_ENABLED`** is een variabele van het repo (geen secret), zodat de voorwaarde van de job hem kan lezen. Zolang hij ontbreekt, uploadt een push naar `main` niets. Zo kan het bouwen beginnen voordat mijn.host klaar is, en is de eerste upload altijd een handmatige proefrun.
- **Actions** staan vast op een commit-SHA, met de versie als comment.
- **`deploy`** draait in de omgeving `mijn-host`, met `concurrency: deploy` en `cancel-in-progress: false`: er loopt hooguit één upload tegelijk, en een lopende upload wordt niet afgebroken.
- **Handmatig starten** (`workflow_dispatch`) heeft een invoer `dry_run` (standaard `false`). Met `true` voegt de workflow `--dry-run` toe aan `lftp mirror`: die toont wat hij zou uploaden en verwijderen, maar verandert niets.

### Upload

- **Verbinding:** SFTP op poort 22, met `lftp` en `ssh` als transport.
  - De publieke sleutel van de server (`h30.mijn.host`, RSA, `SHA256:6ybTN1+2KX9UBykPJK/JXP4rYN+YERJYvfpFEfl1btU`) staat vast in de workflow, met `StrictHostKeyChecking=yes` en `HostKeyAlias=h30.mijn.host`. Wijzigt de sleutel, dan stopt de uitrol; een nieuwe sleutel controleer je bij mijn.host voordat je hem vervangt.
  - Het wachtwoord gaat via `LFTP_PASSWORD` en `--env-password`, niet op de opdrachtregel.
  - Alle paden zijn relatief aan de map waar het account na het inloggen staat (`public_html`).
- **Controle vooraf:** de workflow stopt vóór elke upload, ook bij een proefrun, als die map `domains`, `public_html`, `private_html`, `mail` of `.ssh` bevat, of als `index.html` ontbreekt.
- **Ronde 1:** `mirror --reverse dist/_astro _astro`, zonder verwijderen. Nieuwe bestanden met een hash staan klaar voordat de HTML ernaar verwijst.
- **Ronde 2:** `mirror --reverse --delete --exclude-glob _astro/ --exclude-glob .well-known/ --exclude-glob cgi-bin/ dist/ .`. Wat niet meer in `dist/` staat, verdwijnt. `.well-known/` (het certificaat) en `cgi-bin/` (DirectAdmin) blijven staan.
- **Ronde 3:** `mirror --reverse --delete dist/_astro _astro`: pas nu verdwijnen de oude bestanden in `_astro/`, als de HTML al naar de nieuwe verwijst.
- Alle rondes gebruiken `--no-perms`: de rechten komen van de server, niet van de build.
- **Rooktest:**
  - `https://mvesign.com/` geeft 200 en bevat `<title>`;
  - `https://mvesign.com/article/sonarqube-serialization-pattern` geeft 301 met `Location: https://mvesign.com/notes/sonarqube-serialization-pattern/`.

  Faalt de rooktest, dan faalt de job, en GitHub meldt dat. Bij `dry_run` slaat de workflow de rooktest over.

### Secrets

In de GitHub-omgeving `mijn-host`, die alleen de branch `main` mag gebruiken:

| Secret | Waarde |
|---|---|
| `FTP_SERVER` | De hostnaam van de server bij mijn.host |
| `FTP_USERNAME` | Het FTP-account voor `public_html` |
| `FTP_PASSWORD` | Het wachtwoord daarvan |

Een PR, ook uit een fork, komt nooit bij deze secrets. De waarden vul je zelf in.

Daarnaast de repo-variabele `DEPLOY_ENABLED` (zie *Workflow*). Die zet je op `true` na de livegang.

### Renovate

`renovate.json`, zoals in de andere repo's: `config:recommended`, `Europe/Amsterdam`, maandag voor 7:00, minor, patch en digest samen in één wekelijkse PR, een major pas na akkoord in het Dependency Dashboard. Daarbij `helpers:pinGitHubActionDigests`.

Renovate houdt Astro en de integraties, Node (`.nvmrc`), de actions en `mvesign-brand-assets` bij. Dat laatste is een `github:`-dependency met een semver-tag; Renovate kent die zonder extra instellingen. Een gemergede PR gaat via `deploy` meteen live.

## Testen

`npm test` draait na `npm run build` op `dist/`, zonder extra dependencies:

- **Elke HTML-pagina** heeft `<html lang="nl">`, precies één `<title>`, een `description`, een `canonical` en de tags `og:title`, `og:description`, `og:url` en `og:image`. `404.html` heeft geen `canonical` en geen `og:url` nodig.
- **Geen `<script>`** in de HTML.
- **Elk intern doel** van een redirect in `.htaccess` bestaat in `dist/`.
- **`og-default.png`** is 1200 × 630, volgens de PNG-header.
- **`rss.xml`** heeft evenveel items als er notities zijn.

`astro check` controleert de types en de schema's.

## Overstap

### Wat eerst klaar moet zijn

- `mvesign-brand-assets` v1.0.0 staat op GitHub. Tot die tijd kan het bouwen van de site beginnen, maar `package.json` verwijst bij livegang naar `#v1.0.0`.
- Node 26 lokaal.
- Beheer onder het GitHub-account mvesign: de gh-login op deze machine is het werkaccount en kan dat niet. Jij doet het in de webinterface, of je voegt het account mvesign toe aan gh.

### Inhoud

**Twee notities**, opgehaald uit `api.mvesign.com/articles/<slug>`, naar het Nederlands vertaald (de code blijft zoals hij is), met een nieuwe `description`:

| Slug | `date` | `tags` | `source` |
|---|---|---|---|
| `sonarqube-serialization-pattern` | 2022-12-13 | dotnet, qa | — |
| `dotnetcore-cancellation-tokens` | 2021-12-18 | dotnet | `https://github.com/mvesign/dotnetcore-cancellation-tokens` |

**Tien vervallen artikelen.** Elk krijgt een 301 naar de map in `https://github.com/mvesign/design-patterns/tree/main/`:

| Slug | Map |
|---|---|
| `design-patterns-proxy` | `DesignPatterns.Structural.Proxy` |
| `design-patterns-flyweight` | `DesignPatterns.Structural.Flyweight` |
| `design-patterns-composite` | `DesignPatterns.Structural.Composite` |
| `design-patterns-decorator` | `DesignPatterns.Structural.Decorator` |
| `design-patterns-facade` | `DesignPatterns.Structural.Facade` |
| `design-patterns-bridge` | `DesignPatterns.Structural.Bridge` |
| `design-patterns-abstract-factory` | `DesignPatterns.Creational.AbstractFactory` |
| `design-patterns-builder` | `DesignPatterns.Creational.Builder` |
| `design-patterns-factory-method` | `DesignPatterns.Creational.FactoryMethod` |
| `design-patterns-prototype` | `DesignPatterns.Creational.Prototype` |

Ze vervallen omdat ze uitleg van bekende patronen zijn zonder eigen ervaring. Acht ervan volgen de tekst van refactoring.guru vrijwel woordelijk, en een deel is kapot (een lege kop "Output", `'''` in plaats van ` ``` `).

**Projecten**, als concept geschreven en door jou nagelezen:

| Slug | Project | `repo` |
|---|---|---|
| `home-server` | De home server als GitOps-repo | — (privé). De tekst noemt geen IP-adressen, accounts, mailboxen of details van het netwerk. |
| `brand-assets` | Het huisstijlpakket | `https://github.com/mvesign/mvesign-brand-assets` |
| `website` | Deze site | `https://github.com/mvesign/mvesign-web-www` |
| `umbraco-training` | De vijf Umbraco-trainingsprojecten op één pagina, met links in de tekst | — |
| `vreugde-in-balans` | De site Vreugde in Balans | Alleen als de eigenaar akkoord is |

`year` komt uit de eerste commit van het repo.

**Over mij en de home:** het concept volgt uit wat je bij de bouw aanlevert: de LinkedIn-URL, een paar punten over je loopbaan en je certificaten. Je leest de feiten na in de PR.

### Volgorde

1. **Repo:** maak `mvesign-web-www` openbaar en leeg op GitHub. Bestaat er al een oud `mvesign-web-www`, dan wordt dat eerst verwijderd, na bevestiging vlak ervoor.
2. **Bouwen** volgens het plan, met PR's naar `main`. Zolang `DEPLOY_ENABLED` ontbreekt, uploadt een push naar `main` niets.
3. **Inhoud:** de twee notities, de projecten, Over mij.
4. **mijn.host** (jij):
   - in het controlepaneel van mijn.host (*Webhosting* → pakket → *FTP accounts*) een FTP-account aanmaken dat alleen bij `domains/mvesign.com/public_html` kan (*Hoofdmap*: *Map zelf opgeven*);
   - een back-up van de huidige `public_html` downloaden (zip). Dat is de terugvaloptie.
5. **GitHub** (jij): de omgeving `mijn-host` maken, alleen voor `main`, met de drie secrets; Renovate toegang geven tot het repo.
6. **Proefrun:** de workflow handmatig starten met `dry_run: true`. In de lijst hoort te staan dat de oude bestanden (`build/`, `global.css`) verdwijnen en dat de nieuwe erbij komen. `.well-known/` hoort er niet in te staan.
7. **Livegang:** de workflow handmatig starten zonder `dry_run`. Na de controle in stap 8 zet je `DEPLOY_ENABLED` op `true`; vanaf dan gaat elke push naar `main` vanzelf live.
8. **Controleren:**
   - alle pagina's in licht en donker;
   - de redirects (`www`, `http`, `/article/...`, `/tag/...`) met `curl -I`;
   - de 404-pagina;
   - de cache-headers;
   - een notitie in de LinkedIn Post Inspector, die ook de preview ververst van links die al eerder gedeeld zijn.
9. **Terugdraaien**, als het misgaat: in DirectAdmin eerst `public_html` leegmaken (behalve `.well-known/`) en dan de zip uit stap 4 terugzetten.

### Opruimen

Na stap 8, en per onderdeel na bevestiging vlak ervoor:

- **mijn.host:** het subdomein `api.mvesign.com` met de PHP-bestanden, en het DNS-record `api`.
- **GitHub:** de token intrekken waarmee de API het artikelen-repo las; daarna `mvesign-web-articles`, `mvesign-web-api`, `mvesign-web-frontend` en `mvesign-web-images` verwijderen.
- **Blijft:** `design-patterns`, omdat de tien redirects ernaar wijzen, en `dotnetcore-cancellation-tokens`, omdat de notitie ernaar linkt.

## Later

Bewust niet in de eerste versie:

- **Log / nu bezig:** recente releases en commits uit GitHub. Vraagt een geplande build en de GitHub-API.
- **Een deelafbeelding per notitie** met de titel erin. Vraagt Open Sans als TTF.
- **Een Claude-skill** die van een spec, een TROUBLESHOOT-sectie of een PR een concept-notitie maakt, als PR in dit repo. Let op: wat uit de privé-repo van de home server komt, moet eerst geschoond worden.
- **Een pagina per tag**, als er genoeg notities zijn.

## Afgewezen

- **Aanpak B, PHP bouwt de pagina bij elk bezoek:** GitHub wordt een afhankelijkheid tijdens het draaien, met een limiet op aanvragen zonder key vanaf een gedeeld IP-adres. Daarbij PHP-code die onderhoud en beveiliging vraagt, en een cache die ververst moet worden.
- **Aanpak C, meta-tags in de huidige keten zetten:** de vier repo's, de API en de lege pagina blijven.
- **Gratis statische hosting (GitHub Pages, Cloudflare Pages):** de site blijft bij mijn.host.
- **Twee repo's (inhoud en site apart):** de inloggegevens van mijn.host op twee plekken, of een token om de build te starten. Het bestaande privé-repo openbaar maken toont ook de hele geschiedenis.
- **Hugo:** CSS-imports uit `node_modules` vragen extra werk, en de huisstijl gaat uit van npm en een bundler.
- **Svelte of SvelteKit:** je werkt er liever niet mee. Het probleem van de huidige site zat in de opzet (alles in de browser), niet in Svelte zelf.
- **SSH met rsync:** een SSH-sleutel geeft toegang tot het hele hostingaccount.
- **FTPS:** de FTP-server van mijn.host stuurt geen tussencertificaat mee. Dat certificaat bij elke uitrol zelf ophalen en controleren zou kunnen, maar voegt bewegende delen toe die SFTP niet nodig heeft.
- **De README van een repo als tekst van een project:** zie *Beslissingen*.
- **Alle oude artikelen Engels laten, of alle twaalf vertalen:** tien passen niet bij de werkplaats, en twee vertalingen zijn snel nagelezen.
- **Renovate automatisch laten mergen:** een update die de opmaak verandert, zou ongezien live gaan.

## Bronnen

- mijn.host: https://mijn.host/webhosting/, https://mijn.host/kb/webhosting/verbinden-met-ssh
- Astro: https://docs.astro.build/en/guides/content-collections/, https://docs.astro.build/en/guides/endpoints/, https://docs.astro.build/en/guides/syntax-highlighting/, https://docs.astro.build/en/recipes/rss/, https://docs.astro.build/en/guides/integrations-guide/sitemap/
- Versies: https://www.npmjs.com/package/astro, https://nodejs.org/dist/index.json
- lftp: https://lftp.yar.ru/lftp-man.html
- GitHub-omgevingen: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- De huisstijl: `mvesign/mvesign-brand-assets`, `docs/superpowers/specs/2026-11-21-brand-assets-design.md`, de paragraaf *Gebruik door de website*
