# Case model

A FaultScope Case is one authored lesson about a correctness decision under
failure. Today there is one published Case, [`fs-c01`](fs-c01.md).

| Layer | Responsibility | Current location |
| --- | --- | --- |
| Semantic | Stable Case, step, question, option, visual-state, and anchor IDs; the property and contract being taught | `web/src/case-data.json` and `web/src/case.ts` |
| Teaching | Guided, Challenge, and Deep Dive presentation around those IDs | `web/components/CaseExperience.tsx` and locale Case catalogs |
| Language | Human-language prose and seven programming-language source artifacts | `web/content/cases/fs-c01/locales/` and `examples/` |
| Evidence | What observation supports each claim and which assumptions remain | Authored in Case 01 prose and fixtures; no separate evidence service exists |

The Case owns meaning. The Case reducer owns interaction state. Code Lens owns
the programming-language representation. Human Locale owns presentation
language. The evidence layer records justification and provenance of a claim
inside the lesson; it must not silently turn an observation into a remote
outcome.

Locale changes preserve Case identity, step, answer IDs, and visual state.
Code Lens changes preserve the same semantics. Neither produces a translated
copy of the state machine.

Start with the [authoring guide](authoring-guide.md), then read
[semantic anchors](../code-lenses/semantic-anchors.md) and
[content validation](../testing/content-validation.md).
