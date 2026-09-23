# How to author a Case

This guide describes the required lesson shape and the **current extension
work**. The repository validates one hard-coded Case, `fs-c01`; adding a second
Case is not yet a drop-in content-only task.

## 1. Define the semantic contract

Choose a stable Case ID, untranslated route slug, step/question/option IDs,
visual states, and Case-namespaced semantic anchors. State the observer,
failure model, contract, property, and enforcement boundary. Write a minimal
allowed execution that violates the property before proposing a repair.

Do not write “timeout = failure” or “use idempotency” as the lesson. A missing
response is an observation; the receiver's contract determines what a repeat
may do. Name which actor has authority to decide an outcome and what state
must survive crashes or late retries.

## 2. Build the teaching path

Include a title, initial code situation, established evidence, contract,
property, minimal counterexample, intervention, positive control, scope
challenge, remaining failure surface, transfer exercise, Deep Dive, and
[Six Questions](../product/six-questions.md) recap. Label synthetic assumptions
so readers do not mistake them for a universal network or provider guarantee.
The positive control must show useful progress without violating the property.
The scope challenge must test where protection ends.

## 3. Extend the current implementation

Use [Case 01](fs-c01.md) as the concrete example. Currently the Case metadata
validator, static route generator, source registry, and `CaseExperience`
component know about `fs-c01`. A new Case requires extending those paths and
their tests, then adding seven source representations or explicitly changing
the published coverage rule. Keep semantic IDs in canonical metadata and
locale-neutral state, not in translated prose. Put human wording in locale
catalogs; mark new translations beta until reviewed.

Use `faultscope:begin <case-id>.<decision>` and matching
`faultscope:end ...` markers around each Code Lens region. See the
[Code Lens guide](../code-lenses/contributing.md) for the exact current source
layout and checks.

## 4. Validate before publishing

Run `go run ./tools check` and `go run ./tools check --all` when changing
cross-language behavior. Build and smoke-test the [single binary](../build/build.md).
Review the [content validator's limits](../testing/content-validation.md):
syntax, ID coverage, and fixtures do not prove a distributed correctness
claim. Have an experienced engineer review the counterexample, contract
scope, and remaining surface before marking a Case published.
