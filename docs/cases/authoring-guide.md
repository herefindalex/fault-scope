# How to author a Case

A FaultScope Case teaches one correctness decision under a concrete failure model. Use [Case 01](fs-c01.md), [Case 02](fs-c02.md), [Case 03](fs-c03.md), [Case 04](fs-c04.md), [Case 05](fs-c05.md), [Case 06](fs-c06.md), [Case 07](fs-c07.md), and [Case 08](fs-c08.md) as references. The shared infrastructure supports multiple Cases; a new Case still needs its own reasoning content, visual, Code Lens source regions, translations, and behavioral evidence.

## 1. Define the semantic contract

Choose a stable Case ID and untranslated slug. Define step, question, option, visual-state, and Case-namespaced anchor IDs. State the observer, established evidence, allowed failure, weak contract, property, enforcement boundary, and minimal execution that violates the property. Preserve distinctions such as "the caller did not receive a response" versus "the receiver did not act," or "the broker accepted an event" versus "the consumer processed it."

Provide a positive control showing valid progress, a scope challenge showing where the guarantee ends, a remaining failure surface, a transfer exercise, and a [Six Questions](../product/six-questions.md) recap. Make synthetic assumptions explicit.

## 2. Add Case-specific content

Add canonical metadata in `web/src/case-<number>-data.json` and register it in `web/src/cases.ts`. Metadata remains locale-neutral. Add the English catalog and all supported public Human Locale catalogs in `web/content/cases/<case-id>/locales/`. Register the new Case in `tools/catalogs.go`; the generator writes the frontend's combined catalog map, avoiding a hand-maintained import per locale. Translations change wording, never Case identity or reasoning state. Mark unreviewed translations beta under the [quality policy](../localization/quality-policy.md).

Implement the Case-specific Guided reasoning, Challenge question, Deep Dive, rail values, and visual in a Case content module. Reuse `CaseShell` and `useCaseProgress` for mode tabs, navigation, Evidence / Contract / Property layout, and per-Case persistence. The shared shell must not infer retry, authority, or durability semantics. Cases 02 and 03 currently share a component for their presentation, but their Authority Timeline and Durability Domains remain separate visuals. Adding another Case is **not** a content-only operation.

## 3. Add Code Lens representations

Provide semantic source regions for all seven Code Lenses under `examples/`, with Case-scoped `faultscope:begin` and `faultscope:end` markers. Register each Case's source file in `tools/snippets.go`; generated snippet keys are typed from `web/src/generated/snippets.json`. Add behavioral fixtures and wire them into `tools/languages.go`. The seven languages must express the same distributed contract, not merely translate syntax. See the [Code Lens guide](../code-lenses/contributing.md).

## 4. Route and validate

Published Cases are selected by `visibleCases` in `web/src/cases.ts` and exported as localized static routes. Keep draft Cases excluded from production output unless the existing explicit draft-development switch is enabled. Case progress is keyed by canonical ID, independently of Human Locale and Code Lens.

Run `go run ./tools check --all`, build the single binary, and run the browser E2E suite. Review the [content validator's limits](../testing/content-validation.md): syntax, ID coverage, and synthetic fixtures do not prove a real distributed system. An experienced engineer should review the counterexample, contract scope, and remaining surface before publication.
