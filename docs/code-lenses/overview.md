# Code Lenses

A Code Lens is a programming-language representation of the same canonical
Case decision. Switching it changes displayed source, not the observation,
contract, property, answer IDs, Case progress, or Human Locale.

The current seven lenses are **Go, TypeScript, Python, Java, PHP, C, and C++**.
C and C++ are separate artifacts because their language rules, idioms,
compilers, and behavioral fixtures differ. A `?lang=cpp` query parameter
overrides the saved Code Lens for that visit; actively choosing another lens
saves `faultscope.v1.codeLens` in the browser.

Source files live in `examples/<language>/`. Build tooling extracts regions
identified by [semantic anchors](semantic-anchors.md) into the static web
bundle. Each lens has three behavioral fixtures for the weak repeat, `P → P`
strong-contract repeat, and `P → Q` scope boundary. These fixtures support
the teaching claim but do not turn a synthetic model into a production SDK.

See [contributing](contributing.md) for source markers and focused checks,
and [Human Locale](../localization/overview.md) for the independent prose
dimension.
