---
title: Umbraco-trainingen
description: 'Vijf oefenprojecten bij de Umbraco-trainingen: route hijacking en eigen routing, backoffice-extensies in Lit, beveiliging met CSP en 2FA, en koppelingen met HubSpot en Algolia.'
year: 2026
stack: [Umbraco 17, Umbraco 12, .NET 10, C#, TypeScript, Lit, Vite, uSync]
---
Bij elk onderwerp uit de Umbraco-trainingen bouwde ik een eigen project, met de opdrachten en mijn antwoorden op de kennisvragen erbij. Vier projecten draaien op Umbraco 17 en .NET 10. [Umbraco Security](https://github.com/mvesign/umbraco-security) draait op Umbraco 12 en .NET 7.

De vier projecten op Umbraco 17 hebben dezelfde basis: Central Package Management met `Directory.Packages.props`, lock files voor NuGet en het nieuwe `.slnx`-formaat voor de solution. Documenttypes en datatypes staan met uSync als bestanden in Git. In Fundamentals en MVC hangt dat af van de omgeving. In Development importeert uSync de bestanden bij het opstarten en exporteert het bij elke wijziging. In productie doet uSync geen van beide.

## Fundamentals

[Umbraco Fundamentals](https://github.com/mvesign/umbraco-fundamentals) is de basis van een Umbraco-site, en draait vooral op modellen en views:

- 12 documenttypes, waarvan 5 element types, met een compositie voor de header van een pagina;
- Block Grid en Block List, en Umbraco Forms in een blok en in de rich text editor;
- tags via `ITagQuery`, image crops en drie niveaus template-inheritance;
- een meertalige homepage (en-US en nl-NL), met een taalwisselaar en dictionary items;
- merkkleuren die redacteuren met een colorpicker kiezen, en die de site met een standaardwaarde als terugval in de CSS zet.

De modellen van ModelsBuilder staan in een eigen project, los van de website.

## MVC

[Umbraco MVC](https://github.com/mvesign/umbraco-mvc) is een receptensite in vier projecten, met één richting in de afhankelijkheden: Core, Models, Logic en Website.

- **Route hijacking.** RenderControllers voor recepten en receptoverzichten geven eigen view models aan de views. Die erven van `PublishedContentWrapped`.
- **Eigen routing.** Een `IContentFinder` en een `IUrlProvider` maken van de Home-node de URL van de root van de site. Een composer zet ze vóór de standaardimplementaties:

  ```csharp
  builder.UrlProviders().InsertBefore<NewDefaultUrlProvider, HomeUrlProvider>();
  builder.ContentFinders().InsertBefore<ContentFinderByUrlNew, HomeContentFinder>();
  ```

- **Leden sturen recepten in** via een SurfaceController met `[ValidateUmbracoFormRouteString]`. De service gebruikt de nieuwe services van Umbraco 14 en hoger. De afbeelding gaat als tijdelijk bestand via `ITemporaryFileService` naar `IMediaEditingService`, en het recept via `IContentEditingService.CreateAsync`. Aliassen van properties komen strongly typed uit de ModelsBuilder-modellen (`GetModelPropertyType`), niet als losse strings.
- **Een notification handler** op `ContentPublishingNotification` verplaatst een ingestuurd recept vóór de publicatie naar de juiste plek in de boom.
- **Upvotes** lopen via een API-controller met `[UmbracoMemberAuthorize]`, die ook de public access van de pagina controleert. Een service op `IMemoryCache` houdt dubbel stemmen tegen.

## Security

[Umbraco Security](https://github.com/mvesign/umbraco-security) behandelt de beveiliging van een site op Umbraco 12:

- **Security headers met NetEscapades.** HSTS (twee jaar, met preload), `X-Frame-Options`, `nosniff`, Referrer-Policy en Permissions-Policy, en een Content Security Policy die per directive wordt opgebouwd.
- **Nonces en Subresource Integrity.** Een tag helper zet nonces op inline scripts en styles, en assets van een CDN hebben een sha512-hash.
- **Minder vingerafdruk.** Geen `Server`-header in Kestrel, en geen `X-Powered-By` in IIS. De login van de backoffice geeft buiten localhost een 404, via een rewrite-regel.
- **Uploads controleren.** Een eigen `IFileStreamSecurityAnalyzer` herkent een SVG aan de eerste en laatste 256 bytes, en weigert een SVG met een scripttag.
- **Tweestapsverificatie in de backoffice.** Een eigen two-factor provider voor TOTP, geregistreerd met `AddTwoFactorProvider`, met een setup-view en een QR-code voor de authenticator-app.

## Extending the Backoffice

Sinds versie 14 is de backoffice van Umbraco gebouwd met Web Components. [Extending the Backoffice](https://github.com/mvesign/umbraco-extending-the-backoffice) heeft extensies in TypeScript en Lit. Vite bundelt ze in lib-mode, met zeven entries en `@umbraco` als external, en een `umbraco-package.json`-manifest registreert ze:

- **Een dashboard.** Het leest de huidige gebruiker via de context-API en haalt gebruikers op via een repository. Met het bearer-token uit `UMB_AUTH_CONTEXT` roept het een eigen API aan.
- **Een workspace view op tekstpagina's**, die live meeleest met de redacteur. Hij toont het aantal woorden, de gemiddelde zinslengte, de vijf meest gebruikte woorden, en zinnen van meer dan 25 woorden in rood.
- **Property editors** op een string en op JSON, met een icon picker, een eigen sidebar-modal (`UmbModalToken`) en een bevestiging.
- **Vertalingen, iconen en een entry point.** Vertalingen in het Engels en Nederlands, eigen iconen, en een entry point dat een standaarddashboard verbergt.

Een dashboard, een header app, een section en een workspace view staan er ook in gewoon JavaScript, zonder build-stap, om de twee manieren te vergelijken.

Achter het dashboard zit een eigen API in de stijl van de Management API. Die gebruikt `[MapToApi]` met een eigen Swagger-document, API-versies, de policy `BackOfficeAccess` en de JSON-opties van de backoffice. De API geeft de audit-trail van een gebruiker, per pagina.

## Application Integration

[Application Integration](https://github.com/mvesign/umbraco-application-integration) is de grootste van de vijf, op Umbraco 17.2, met drie projecten: Models, Logic en Website.

- **UI Builder.** Een eigen section voor data die niet in Umbraco staat, met een list view, zoeken, filters, cards, import en export, een eigen action en rechten per user group. De data komt uit een eigen `Repository<Book, int>` op JSON-bestanden. In de content-section staat een dashboard.
- **Algolia.** De frontend zoekt met InstantSearch in twee indexen tegelijk.
- **Een eigen Examine-index.** Een Lucene-index (`AddExamineLuceneIndex`) met een `IndexPopulator` die boeken uit Algolia ophaalt, en een eigen `IValueSetBuilder`. Zo komt externe data in de zoekindex van Umbraco.
- **HubSpot.** De definitie van een formulier komt uit de Marketing Forms API en wordt in de pagina opgebouwd. Een inzending gaat naar de Submissions API en komt daarna ook als review in Umbraco. De toegang loopt via OAuth met Umbraco.AuthorizedServices, met de API-key van een private app als terugval.
- **Umbraco Mapper.** De vertaling tussen DTO's en modellen staat in mapdefinities, niet verspreid over controllers.
