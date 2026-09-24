# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Interaktywne laboratorium do nauki poprawności aplikacji rozproszonych.**

FaultScope wychodzi od dostępnych dowodów i kontraktów systemu, aby ustalić, co nadal można zagwarantować po awarii. Każdy przypadek najpierw określa własność, którą trzeba zachować, a potem granicę wymagającą naprawy.

## Poznaj osiem przypadków

1. [Czy wysłać ponownie?](docs/cases/fs-c01.md) — Odpowiedź nie dotarła, ale maszyna VM mogła już powstać. To kontrakt określa, co wolno zrobić dalej.
2. [Czy A może jeszcze zapisać wynik po przejęciu zadania przez B?](docs/cases/fs-c02.md) — Worker B przejął Job J, ale A nadal działa. O tym, czy wynik A będzie ważny, decyduje kontrola w Job Store.
3. [Zamówienie zatwierdzone. Gdzie jest Event E?](docs/cases/fs-c03.md) — Order42 ma w PostgreSQL stan CONFIRMED, ale proces ulega awarii przed opublikowaniem Event E. Jaki trwały zapis pozwoli opublikować E później?
4. [Konsument zakończył pracę. Dlaczego uruchomił się ponownie?](docs/cases/fs-c04.md) — Przyznana nagroda i brak potwierdzenia mogą spowodować, że jedno logiczne zdarzenie pojawi się dwukrotnie.
5. [Które zdarzenie jest naprawdę nowsze?](docs/cases/fs-c05.md) — Późniejsza dostawa może nosić starszy stan. Znajdź organ, który zarządza zmiany w jednej przesyłce.
6. [Odczyt się powiódł. Czy dane są wystarczająco aktualne?](docs/cases/fs-c06.md) — Pomyślna odpowiedź może być nadal za stara dla tego obiektu wywołującego. Przenieś zatwierdzoną wersję do przeczytanej umowy.
7. [Czy anulowanie naprawdę zatrzymało pracę?](docs/cases/fs-c07.md) — Otrzymano sygnał anulowania, ale przekazanie wyniku może pozostać zablokowane. Znajdź operację, która musi uczestniczyć.
8. [System uruchomił się ponownie. O czym zapomniał?](docs/cases/fs-c08.md) — Shipment42 po awarii nadal wyświetla SHIPPED. Strażnik rewizyjny, który go chronił, zniknął.

Każdy przypadek obejmuje tryby Prowadzony, Wyzwanie i Dogłębna analiza, własną wizualizację, panel Dowody / Kontrakt / Własność oraz siedem perspektyw kodu. Postęp dla każdego przypadku zapisuje się w przeglądarce.

## Uruchamianie FaultScope

Wydaną wersję uruchomisz poleceniem `./faultscope`. Aby zbudować bieżącą wersję poglądową ze źródeł:

```bash
go run ./tools build
./dist/faultscope
```

Otwórz [http://localhost:8080/](http://localhost:8080/). Domyślnie `:8080` nasłuchuje na wszystkich interfejsach. Inny adres ustawisz przez `./dist/faultscope --listen 127.0.0.1:9000` lub `FAULTSCOPE_LISTEN=127.0.0.1:9000`; opcja wiersza poleceń ma pierwszeństwo. Do budowania ze źródeł potrzebne są Node 24 i pnpm 12. Zobacz [instrukcję dla programistów](docs/development/getting-started.md).

## Stan i architektura

To **wersja poglądowa `0.0.x`** z opublikowanymi przypadkami 01–08. Przykłady maszyn VM, zadań, zamówień, wiadomości i nagród to modele edukacyjne, a nie produkcyjne SDK ani infrastruktura. Wszystkie 20 języków ma komplet komunikatów interfejsu i ośmiu przypadków; 19 tłumaczeń innych niż angielskie pozostaje w **wersji beta bez przeglądu specjalistów będących rodzimymi użytkownikami języka**. Język interfejsu i perspektywę kodu wybiera się niezależnie. Dostępnych jest siedem perspektyw: **Go, TypeScript, Python, Java, PHP, C i C++**. Frontend Next.js/React powstaje jako pliki statyczne osadzone w jednym pliku wykonywalnym Go. Podczas działania nie potrzeba serwera Node, bazy danych, katalogu treści ani usługi tłumaczeniowej. Preferencje i postęp pozostają tylko w przeglądarce.

## Dokumentacja i współpraca

Dokumentacja techniczna jest obecnie po angielsku: [spis](docs/README.md), [poradnik tłumaczenia](docs/localization/translation-guide.md), [poradnik tworzenia przypadków](docs/cases/authoring-guide.md), [udział w rozwoju perspektyw kodu](docs/code-lenses/contributing.md) i [licencja MIT](LICENSE).
