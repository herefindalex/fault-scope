# Case model

A FaultScope Case is an authored lesson about one correctness decision under failure. Five Cases are published:

| Case | Primary question | Reasoning dimension |
| --- | --- | --- |
| [FS-C01](fs-c01.md) | Should you send it again? | Ambiguous outcome and identity |
| [FS-C02](fs-c02.md) | Can the old worker still commit? | Authority |
| [FS-C03](fs-c03.md) | The database committed. Where is the event? | Durability and atomicity |
| [FS-C04](fs-c04.md) | The consumer finished. Why did it run again? | Delivery and repeated effects |
| [FS-C05](fs-c05.md) | Which event is actually newer? | Source-defined ordering |

The [Case registry](../../web/src/cases.ts) holds stable identity and structural metadata. [CaseShell](../../web/components/CaseShell.tsx) and [useCaseProgress](../../web/components/useCaseProgress.ts) handle shared interaction and per-Case persistence. Each Case owns its failure model, reasoning, rail values, and visual. Code Lenses present the same semantics in seven programming languages; Human Locales change only the explanation and interface language. Neither changes the canonical Case state.

Start with the [authoring guide](authoring-guide.md), then read [semantic anchors](../code-lenses/semantic-anchors.md) and [content validation](../testing/content-validation.md).
