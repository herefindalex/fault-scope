# Contributing

What do you want to change?

| Area | Start here |
| --- | --- |
| UI or visual behavior | [Developer setup](docs/development/getting-started.md) and [accessibility](docs/product/accessibility.md) |
| Case semantics or teaching content | [Case authoring](docs/cases/authoring-guide.md) |
| Human language translation | [Translation guide](docs/localization/translation-guide.md) |
| Code Lens source or fixtures | [Code Lens contributing](docs/code-lenses/contributing.md) |
| Go HTTP runtime | [Runtime contract](docs/architecture/runtime-contract.md) and [testing strategy](docs/testing/strategy.md) |
| Build or release | [Build guide](docs/build/build.md) and [release guide](docs/build/release.md) |

Install only the toolchains needed for your area. Run the focused check first,
then `go run ./tools check` for changes that affect the application. Run
`go run ./tools check --all` when changing shared Case or Code Lens behavior.
See [developer commands](docs/development/commands.md) for exact effects.

Preserve Case IDs, step/question/option IDs, and semantic anchors when editing
presentation. Do not turn a missing completion response into a claim that the
remote effect failed. For reported security issues, use [SECURITY.md](SECURITY.md).
