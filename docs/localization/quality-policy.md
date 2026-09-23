# Translation quality and status

Distributed-correctness wording can change the answer if “attempt,”
“logical operation,” or “completion response” is mistranslated. Status
metadata therefore describes review state, not Case semantics.

| Status | Meaning | Route and validation behavior |
| --- | --- | --- |
| `source` | Complete English authoring baseline | Complete messages required; indexable |
| `beta` | Complete catalog awaiting technical and native-speaker review | Complete UI/Case keys and step IDs required; noindex |
| `reviewed` | Complete translation reviewed for technical meaning | Complete UI/Case keys and step IDs required; indexable |
| `draft` | Not ready for a public localized route | Excluded from generated public routes |

The current registry has one `source` locale (`en`), 19 `beta` locales, and no
`reviewed` or `draft` locales. The beta strings were generated during
implementation and **have not been reviewed by a native speaker or
distributed-systems specialist**. Do not present machine-generated or
model-generated translation as human-reviewed.

Review a candidate against the English source and the canonical
[Case 01 model](../cases/fs-c01.md). Check every mandatory message, option,
feedback statement, counterexample, contract scope, and remaining failure
surface. Preserve placeholders and stable IDs. Only then change registry
status to `reviewed` and run `go run ./tools check --locale <id>` plus a
localized browser preview. A change to status never changes the Case reducer
or Code Lens source.

See [translation steps](translation-guide.md) and [terminology](style-guide.md).
