# FS-C03: The Database Committed. Where Is the Event?

**Primary reasoning dimension:** durability and atomicity. The interactive route `/en/cases/database-committed-where-is-event/` presents Order42, Event E, PostgreSQL, a message broker, and later a relay.

## Contract and property

The weak implementation commits `Order42 = CONFIRMED` in the database and then calls `broker.Publish(E)`. The database commit succeeds; the process crashes before publication. The two operations occupy separate durability domains. Order42 is authoritative, but neither Event E nor a durable obligation to publish it exists.

> If Order42 becomes authoritatively CONFIRMED, a durable publication obligation for Event E must also exist.

The repair commits both `Order42 = CONFIRMED` and `Outbox E = PENDING` in **one database transaction**. Either both facts survive or neither does. A relay can later publish E. The outbox makes the publication obligation survive the business commit; it does not make PostgreSQL and the broker one transaction.

## Positive controls and remaining surface

A successful transaction leaves both facts durable, and the relay can publish E and record completion. A rolled-back transaction leaves neither fact committed.

The broker may accept E just before the relay crashes, leaving the outbox row `PENDING`. On restart the relay may publish E again. **The original property remains preserved**: the obligation survived. Duplicate delivery is a new remaining failure surface. Marking E `SENT` before publishing can instead lose publication after a crash. This Case does not claim exactly-once delivery, consumer processing, or that every architecture needs an outbox table.

The Durability Domains visual is Case-specific. Guided mode follows the crash gap, repair, controls, relay crash, duplicate possibility, transfer, and Six Questions recap. Challenge asks whether the weak architecture guarantees a durable obligation. Deep Dive examines the shared transaction and the next relay-to-broker boundary.

## Implementation and evidence

- Canonical metadata: `web/src/case-03-data.json`
- Human copy: `web/content/cases/fs-c03/locales/`
- Case reasoning and Durability Domains: `web/components/LaterCaseExperience.tsx`
- Seven Code Lens sources and behavioral fixtures: `examples/<language>/case03*` (Java and PHP use `Case03*`)
- Shared route, progress, and navigation: `web/src/cases.ts`, `web/components/useCaseProgress.ts`, and `web/components/CaseShell.tsx`

The fixtures prove the synthetic database and relay model. They do not establish a real broker's delivery semantics or a consumer's behavior.
