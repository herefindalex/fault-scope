# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Laboratorio interattivo per comprendere la correttezza delle applicazioni distribuite.**

FaultScope parte dalle prove disponibili e dai contratti del sistema per capire cosa resta garantito dopo un guasto. Ogni caso chiarisce prima la proprietà da preservare, poi individua il confine su cui intervenire.

![FaultScope: Gli otto casi pubblicati nell’interfaccia in inglese](docs/images/cases-en.png)

*Gli otto casi pubblicati nell’interfaccia in inglese.*

## Esplora gli otto casi

1. [Dovresti inviarlo di nuovo?](docs/cases/fs-c01.md) — La risposta non arriva, ma la VM potrebbe già esistere. È il contratto a dirti cosa puoi fare ora.
2. [A può ancora salvare il risultato dopo il passaggio a B?](docs/cases/fs-c02.md) — Worker B ha preso in carico Job J, ma A è ancora in esecuzione. È il controllo del Job Store a decidere se il risultato di A può avere effetto.
3. [L’ordine è confermato. Dov’è Event E?](docs/cases/fs-c03.md) — Order42 è CONFIRMED in PostgreSQL, ma il processo si interrompe prima di pubblicare Event E. Quale dato persistente garantirà che E venga pubblicato in seguito?
4. [Il consumer aveva finito. Perché è stato eseguito di nuovo?](docs/cases/fs-c04.md) — Una ricompensa impegnata e un riconoscimento mancato possono far sì che un evento logico arrivi due volte.
5. [Quale evento è davvero più recente?](docs/cases/fs-c05.md) — Una consegna successiva può riportare lo stato precedente. Trova l'autorità che ordina le modifiche a una spedizione.
6. [Lettura riuscita. I dati sono abbastanza aggiornati?](docs/cases/fs-c06.md) — Una risposta riuscita può essere ancora troppo vecchia per questo chiamante. Trasportare la revisione impegnata nel contratto letto.
7. [L’annullamento ha davvero fermato il lavoro?](docs/cases/fs-c07.md) — È arrivato il segnale di annullamento, ma il trasferimento dei risultati può rimanere bloccato. Trova l'operazione a cui deve partecipare.
8. [Si è riavviato. Che cosa ha dimenticato?](docs/cases/fs-c08.md) — Shipment42 dice ancora SHIPPED dopo un incidente. La guardia di revisione che lo proteggeva non c'è più.

Ogni caso offre le modalità Guidata, Sfida e Approfondimento, una visualizzazione dedicata, un pannello Prove / Contratto / Proprietà e sette viste del codice. I progressi di ciascun caso vengono salvati nel browser.

## Avvia FaultScope

Puoi avviare la versione distribuita con `./faultscope`. Per compilare l’attuale anteprima dal codice sorgente:

```bash
go run ./tools build
./dist/faultscope
```

Apri [http://localhost:8080/](http://localhost:8080/). Per impostazione predefinita, `:8080` ascolta su tutte le interfacce. Puoi scegliere un altro indirizzo con `./dist/faultscope --listen 127.0.0.1:9000` o `FAULTSCOPE_LISTEN=127.0.0.1:9000`; l’opzione da riga di comando ha la precedenza. La compilazione richiede Node 24 e pnpm 12; consulta la [guida iniziale](docs/development/getting-started.md).

## Stato e architettura

Questa è un’**anteprima `0.0.x`** con i casi 01–08 pubblicati. Gli esempi di VM, lavori, ordini, messaggi e ricompense sono modelli didattici, non SDK o infrastruttura di produzione. Tutte le 20 lingue hanno messaggi completi per l’interfaccia e gli otto casi; le 19 traduzioni diverse dall’inglese restano **beta, senza revisione da parte di specialisti madrelingua**. La lingua dell’interfaccia e la vista del codice si scelgono separatamente. Sono disponibili sette viste: **Go, TypeScript, Python, Java, PHP, C e C++**. Il frontend Next.js/React viene esportato come file statici e incorporato in un solo eseguibile Go. In esecuzione non servono server Node, database, directory dei contenuti o servizi di traduzione. Preferenze e progressi rimangono solo nel browser.

## Documentazione e contributi

La documentazione tecnica è attualmente in inglese: [indice](docs/README.md), [guida alla traduzione](docs/localization/translation-guide.md), [guida alla scrittura dei casi](docs/cases/authoring-guide.md), [contributi alle viste del codice](docs/code-lenses/contributing.md) e [licenza MIT](LICENSE).
