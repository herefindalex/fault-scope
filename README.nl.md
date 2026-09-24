# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Interactief leerlaboratorium voor de correctheid van gedistribueerde applicaties.**

FaultScope vertrekt vanuit bewijs en systeemcontracten om te onderzoeken wat na een storing nog gegarandeerd is. Elk geval maakt eerst duidelijk welke eigenschap behouden moet blijven en zoekt daarna de grens waar een ingreep nodig is.

## Ontdek de acht gevallen

1. [Moet je het opnieuw versturen?](docs/cases/fs-c01.md) — Het antwoord komt niet aan, maar de VM bestaat misschien al. Het contract bepaalt wat je nu veilig kunt doen.
2. [Kan A nog een resultaat opslaan nadat B het werk overneemt?](docs/cases/fs-c02.md) — Worker B heeft Job J overgenomen, maar A draait nog. De controle in de Job Store bepaalt of het resultaat van A nog geldig is.
3. [De bestelling is bevestigd. Waar blijft Event E?](docs/cases/fs-c03.md) — Order42 staat in PostgreSQL op CONFIRMED, maar het proces crasht voordat Event E wordt gepubliceerd. Welke blijvende registratie zorgt dat E later alsnog wordt gepubliceerd?
4. [De consumer was klaar. Waarom draaide hij opnieuw?](docs/cases/fs-c04.md) — Een toegewijde beloning en een ontbrekende erkenning kunnen ervoor zorgen dat een logische gebeurtenis tweemaal plaatsvindt.
5. [Welk event is echt nieuwer?](docs/cases/fs-c05.md) — Een latere levering kan een oudere staat dragen. Zoek de autoriteit die wijzigingen in één zending bestelt.
6. [De leesactie is gelukt. Zijn de gegevens actueel genoeg?](docs/cases/fs-c06.md) — Een succesvol antwoord kan voor deze beller nog te oud zijn. Neem de vastgelegde revisie over in het leescontract.
7. [Heeft annuleren het werk echt gestopt?](docs/cases/fs-c07.md) — Het annuleringssignaal is aangekomen, maar een resultaatoverdracht kan geblokkeerd blijven. Zoek de bewerking die moet deelnemen.
8. [Het is opnieuw opgestart. Wat is het vergeten?](docs/cases/fs-c08.md) — Shipment42 zegt nog steeds SHIPPED na een crash. De revisiebewaker die hem beschermde is verdwenen.

Elk geval heeft de modi Begeleid, Uitdaging en Verdieping, een eigen visualisatie, een paneel voor Bewijs / Contract / Eigenschap en zeven codeperspectieven. De voortgang per geval wordt in de browser bewaard.

## FaultScope uitvoeren

Een uitgebrachte versie start je met `./faultscope`. Bouw de huidige preview vanuit de broncode met:

```bash
go run ./tools build
./dist/faultscope
```

Open [http://localhost:8080/](http://localhost:8080/). Standaard luistert `:8080` op alle netwerkinterfaces. Kies een ander adres met `./dist/faultscope --listen 127.0.0.1:9000` of `FAULTSCOPE_LISTEN=127.0.0.1:9000`; de opdrachtregeloptie heeft voorrang. Voor een broncodebuild zijn Node 24 en pnpm 12 nodig. Zie de [ontwikkelhandleiding](docs/development/getting-started.md).

## Status en architectuur

Dit is een **`0.0.x`-preview** met de gepubliceerde gevallen 01–08. De voorbeelden met VM’s, taken, bestellingen, berichten en beloningen zijn lesmodellen, geen SDK’s of infrastructuur voor productie. Voor alle 20 talen zijn de interfaceberichten en de berichten van de acht gevallen compleet; de 19 niet-Engelse vertalingen zijn nog **bèta en niet nagekeken door moedertaalsprekende vakspecialisten**. De interfacetaal en het codeperspectief kies je onafhankelijk. De zeven perspectieven zijn **Go, TypeScript, Python, Java, PHP, C en C++**. De Next.js/React-frontend wordt als statische bestanden gebouwd en in één Go-programma opgenomen. Tijdens gebruik zijn geen Node-server, database, inhoudsmap of vertaaldienst nodig. Voorkeuren en voortgang blijven alleen in de browser.

## Documentatie en bijdragen

De technische documentatie is momenteel Engelstalig: [overzicht](docs/README.md), [vertaalhandleiding](docs/localization/translation-guide.md), [handleiding voor nieuwe gevallen](docs/cases/authoring-guide.md), [bijdragen aan codeperspectieven](docs/code-lenses/contributing.md) en [MIT-licentie](LICENSE).
