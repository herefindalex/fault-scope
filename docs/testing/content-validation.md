# Content validation

`go run ./tools check` regenerates Code Lens snippets and validates Case 01
metadata and all Human Locale catalogs before running tests. Focused commands
are in [developer commands](../development/commands.md).

The current validator checks:

- Case 01's fixed ID, stable slug, and `draft` or `published` lifecycle;
  unique nonempty step, visual, anchor, lens, and section IDs; Guided and
  Challenge entry steps; required question options and visual states.
- For a published Case, required semantic anchors, all seven Code Lens IDs,
  and required sections.
- Every Code Lens source has exactly one nonempty region per expected anchor,
  with matching, nonnested `faultscope:begin` and `faultscope:end` markers.
- Locale registry IDs, names, direction, status, and Arabic RTL direction;
  known shared keys, nonempty values, duplicate JSON keys, placeholder parity,
  Case identity, and valid step IDs. Every public locale (`source`, `beta`, or `reviewed`) requires complete UI/Case message sets and Case step coverage.

It does **not** judge the translation's technical meaning, prove that a
counterexample is minimal, verify a real cloud provider's contract, or prove
that all legal executions preserve the property. A second Case requires
extending the current hard-coded schema and routes. See the
[translation quality policy](../localization/quality-policy.md) and
[Case authoring guide](../cases/authoring-guide.md).
