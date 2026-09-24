# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Interaktives Lernlabor für die Korrektheit verteilter Anwendungen.**

FaultScope geht von Belegen und Systemverträgen aus und fragt, was nach einem Fehler noch garantiert ist. Jeder Fall macht zuerst die zu bewahrende Eigenschaft klar und sucht dann die Grenze, an der eine Änderung nötig ist.

## Acht Fälle erkunden

1. [Sollten Sie es erneut senden?](docs/cases/fs-c01.md) — Die Antwort bleibt aus, doch die VM könnte bereits erstellt sein. Was als Nächstes zulässig ist, steht im Vertrag.
2. [Darf Worker A nach der Übernahme noch schreiben?](docs/cases/fs-c02.md) — Worker B hat Job J übernommen, doch A läuft weiter. Ob As Ergebnis gilt, entscheidet die Prüfung im Job Store.
3. [Die Bestellung ist bestätigt. Wo bleibt Event E?](docs/cases/fs-c03.md) — Order42 steht in PostgreSQL auf CONFIRMED. Vor dem Veröffentlichen von Event E stürzt der Prozess ab. Welcher dauerhafte Eintrag sorgt dafür, dass E später noch veröffentlicht wird?
4. [Der Consumer war fertig. Warum lief er noch einmal?](docs/cases/fs-c04.md) — Eine zugesagte Belohnung und eine fehlende Anerkennung können dazu führen, dass ein logisches Ereignis zweimal eintritt.
5. [Welches Ereignis ist wirklich neuer?](docs/cases/fs-c05.md) — Eine spätere Lieferung kann einen älteren Zustand aufweisen. Finden Sie die Behörde, die Änderungen an einer Sendung anordnet.
6. [Lesen erfolgreich. Sind die Daten aktuell genug?](docs/cases/fs-c06.md) — Eine erfolgreiche Antwort kann für diesen Anrufer noch zu alt sein. Übernehmen Sie die festgeschriebene Revision in den Lesevertrag.
7. [Hat der Abbruch die Arbeit wirklich beendet?](docs/cases/fs-c07.md) — Das Abbruchsignal ist angekommen, eine Ergebnisübergabe kann jedoch blockiert bleiben. Finden Sie den Vorgang, der teilnehmen muss.
8. [Es wurde neu gestartet. Was hat es vergessen?](docs/cases/fs-c08.md) — Shipment42 sagt nach einem Absturz immer noch SHIPPED. Der Revisionswächter, der es schützte, ist verschwunden.

Jeder Fall bietet die Modi Geführt, Herausforderung und Vertiefung, eine eigene Visualisierung, eine Leiste für Belege / Vertrag / Eigenschaft sowie sieben Code-Perspektiven. Der Fortschritt wird je Fall im Browser gespeichert.

## FaultScope starten

Eine veröffentlichte Binärdatei lässt sich mit `./faultscope` starten. So baust du die aktuelle Vorschau aus dem Quellcode:

```bash
go run ./tools build
./dist/faultscope
```

Öffne [http://localhost:8080/](http://localhost:8080/). Standardmäßig lauscht `:8080` auf allen Netzwerkschnittstellen. Eine andere Adresse kannst du mit `./dist/faultscope --listen 127.0.0.1:9000` oder `FAULTSCOPE_LISTEN=127.0.0.1:9000` wählen; die Kommandozeilenoption hat Vorrang. Für den Bau aus dem Quellcode brauchst du Node 24 und pnpm 12. Siehe [Entwicklungsanleitung](docs/development/getting-started.md).

## Stand und Architektur

Dies ist eine **`0.0.x`-Vorschau** mit den veröffentlichten Fällen 01–08. Die Beispiele zu VMs, Aufträgen, Bestellungen, Nachrichten und Belohnungen sind Lehrmodelle, keine produktiven SDKs oder Infrastruktur. Für alle 20 Sprachen sind UI und Meldungen der acht Fälle vollständig; die 19 nicht englischen Übersetzungen sind weiterhin **Beta und nicht von muttersprachlichen Fachleuten geprüft**. Anzeigesprache und Code-Perspektive lassen sich unabhängig wählen. Die sieben Perspektiven sind **Go, TypeScript, Python, Java, PHP, C und C++**. Das Next.js/React-Frontend wird als statische Dateien gebaut und in eine einzige Go-Binärdatei eingebettet. Zur Laufzeit sind weder Node-Server noch Datenbank, Content-Verzeichnis oder Übersetzungsdienst nötig. Einstellungen und Lernfortschritt liegen nur im Browser.

## Dokumentation und Mitarbeit

Die technische Dokumentation ist derzeit auf Englisch: [Übersicht](docs/README.md), [Übersetzungsanleitung](docs/localization/translation-guide.md), [Anleitung für neue Fälle](docs/cases/authoring-guide.md), [Code-Perspektiven beitragen](docs/code-lenses/contributing.md) und [MIT-Lizenz](LICENSE).
