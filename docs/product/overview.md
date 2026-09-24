# Product overview

FaultScope is an interactive lab for engineers who need to reason about distributed application correctness. Ordinary-looking code can be unsafe when the completion response, current authority, or durable publication obligation is unclear. A pattern name alone does not decide whether a specific contract preserves a property.

Four [authored Cases](../cases/README.md) are published:

- [Case 01](../cases/fs-c01.md): an ambiguous `CreateVM` response and the identity of a retry.
- [Case 02](../cases/fs-c02.md): a stale worker that may still execute after authority moved to another generation.
- [Case 03](../cases/fs-c03.md): a database commit separated from event publication by a crash gap.
- [Case 04](../cases/fs-c04.md): a committed reward repeated when an event is redelivered without an atomic processed-event record.

**Guided** reveals evidence and contracts step by step. **Challenge** asks for a decision with less guidance. **Deep Dive** examines the repair's limits. Each Case has its own browser-stored progress. The [Six Questions](six-questions.md) organize reasoning: what was established, what the contract allows, which property matters, where it is enforced, whether the counterexample remains, and what can still fail after repair.

**Human Locale** changes prose and layout. **Code Lens** changes the displayed source artifact; the choices are independent. All 20 locales have complete UI and Case 01–04 catalogs. The 19 non-English locales are [unreviewed beta content](../localization/quality-policy.md). See [non-goals](non-goals.md) and [accessibility](accessibility.md).
