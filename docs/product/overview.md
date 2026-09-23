# Product overview

Faultscope is an interactive lab for engineers who need to reason about
distributed application correctness. A remote call can have an effect even
when its completion response never reaches the caller. Ordinary-looking retry
code then needs more than a pattern name to judge it.

The current published lesson is [Case 01](../cases/fs-c01.md), about an
ambiguous `CreateVM` request. **Guided** mode reveals evidence and contracts
step by step. **Challenge** mode asks for a decision with less guidance.
**Deep Dive** explains the boundaries of the synthetic contract. These three
modes share one canonical Case and browser-stored progress.

The [Six Questions](six-questions.md) organize the reasoning: what is
established, what the contract allows, what property matters, where it is
enforced, whether a counterexample remains, and what fails after repair.
Faultscope also asks who has authority to decide an outcome, what must be
durable, and which failure boundary invalidates an assumption. Case 01 treats
some of these through identity continuity and receiver scope; it is not yet a
general course on every distributed-system failure.

**Human Locale** changes prose and layout. **Code Lens** changes the displayed
source artifact. They are independent: Japanese explanations can accompany
C++ source. English learning content is complete; the other 19 locales are
[unreviewed beta content](../localization/quality-policy.md) with English
message fallback.

See [non-goals](non-goals.md) for the current product boundary and
[accessibility](accessibility.md) for implemented behavior and remaining checks.
