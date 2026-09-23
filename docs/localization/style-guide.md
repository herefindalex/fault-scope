# Terminology for correctness-sensitive translations

Translate the technical relationship, not the English word in isolation.
Use terms experienced engineers recognize in the target language. A familiar
English term in parentheses is acceptable when it removes ambiguity; avoid
awkward literal translations.

| Source term | Distinction to preserve |
| --- | --- |
| logical operation | The intended effect identified across attempts; not one network send |
| attempt | One transmission or execution try; multiple attempts can belong to one operation |
| remote effect | State change at the receiver; a missing response does not prove its absence |
| completion response | The caller's evidence of completion; it can be lost after an effect |
| contract | The stated guarantees and scope of an interface, not merely observed behavior |
| property | What must remain true in every execution allowed by the stated model |
| authority / authoritative state | Who may decide the outcome and which state is trusted for that decision |
| generation | A version or epoch that distinguishes newer ownership from stale work |
| durability | Which fact survives crash/restart, and under which storage guarantee |
| publication obligation | A required later publication after a committed change; not a claim that it already happened |
| unresolved | Neither success nor failure established; do not translate as “failed” |
| counterexample | A concrete allowed execution that violates the property |

In [Case 01](../cases/fs-c01.md), keep the difference between “no completion
response” and “no VM created.” Preserve `P → P` versus `P → Q` as identity
sequences. Do not make a synthetic receiver guarantee sound universal.

See the [quality policy](quality-policy.md) before promoting a locale and
the [Six Questions](../product/six-questions.md) for the reasoning context.
