# Semantic anchors

A semantic anchor connects a Case decision to a region in every Code Lens:

```text
Case decision
    ↓
fs-c01.retry-same-logical-operation
    ↓
Go / TypeScript / Python / Java / PHP / C / C++
```

Anchors are **Case-namespaced**, not a global distributed-systems ontology.
Current `fs-c01` anchors are `retry-independent-attempt`,
`keep-unresolved`, `retry-same-logical-operation`, and
`retry-with-new-logical-operation`. The canonical list is in
`web/src/case-data.json` and extraction expectations in
`tools/snippets.go`.

Region markers bracket source text in each `examples/` file. The generator
uses the anchor and Code Lens ID to produce `web/src/generated/snippets.json`
for the frontend. A source refactor may change lines and function names;
preserve the anchor if the semantic decision is unchanged. If the decision
changes, review the Case model and all seven representations rather than
quietly reusing an old anchor.

Missing required anchors block published Case validation/generation.
See [the contributor guide](contributing.md),
[content validation](../testing/content-validation.md), and
[Case authoring](../cases/authoring-guide.md).
