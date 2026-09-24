# Content validation

`go run ./tools check` regenerates Code Lens snippets, validates the seven published Cases and all public Human Locale catalogs, then runs the web and Go checks. `go run ./tools check --all` also compiles and executes the seven Code Lens fixture suites. See [developer commands](../development/commands.md).

The validator checks:

- Each Case's stable ID, slug, lifecycle status, unique step/visual/anchor/lens/section IDs, Guided and Challenge entries, required question options, visual states, sections, and all seven Code Lens IDs.
- Every Case-scoped semantic anchor has one nonempty, matching, nonnested `faultscope:begin` / `faultscope:end` region per Code Lens.
- Locale registry IDs, names, direction, status, Arabic RTL direction, known keys, nonempty values, duplicate JSON keys, placeholder parity, Case identity, and valid step IDs.
- Every public locale (`source`, `beta`, or `reviewed`) has complete UI and Case 01–07 message sets and step coverage.

Browser E2E tests additionally traverse every Guided step for each published Case in every public locale, reach Challenge and Deep Dive, and check mode, language, locale, and per-Case progress behavior. Behavioral fixtures demonstrate the weak and repaired contracts in seven languages.

These checks do **not** judge translation quality or technical meaning, prove that a counterexample is minimal, verify a real provider's contract, or establish correctness for every legal execution. See the [translation quality policy](../localization/quality-policy.md) and [Case authoring guide](../cases/authoring-guide.md).
