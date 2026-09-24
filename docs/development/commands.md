# Developer commands

Run `go run ./tools ...` from the repository root. The Go tool orchestrates builds and checks; it does not replace the language toolchains.

| Command | Purpose | Prerequisites |
| --- | --- | --- |
| `doctor` | Reports Go, Node, pnpm, and Git paths; requires Node 24 and pnpm 12 | Core tools |
| `generate` | Extracts Case-scoped Code Lens regions and regenerates the combined Cases 02–04 locale map | Go and registered source/catalog files |
| `dev` | Generates snippets, watches source regions, and starts Next.js on its default port 3000 | Go, Node 24, pnpm 12, web dependencies |
| `preview` | Builds and starts the production-shaped Go executable | Build prerequisites |
| `check` | Validates docs, snippets, Cases, and locales; runs Go tests, frontend typecheck, formatting, and tests | Core tools and web dependencies |
| `check --all` | Also runs all seven Code Lens compilers and behavioral fixture suites for Cases 01–06 | Full toolchain set |
| `check --docs` | Checks local Markdown targets and documentation index coverage | Go |
| `check --locale ja` | Validates one Human Locale catalog | Go |
| `check --case fs-c02 --language cpp` | Generates snippets, validates Case metadata, and checks one Code Lens | Go and selected language toolchain |
| `build` | Creates `dist/faultscope` with embedded static content | Go, Git, Node 24, pnpm 12, web dependencies |
| `smoke` | Probes `dist/faultscope`, deep routes, and embedded manifest | Built binary |
| `pnpm --dir web e2e` | Runs browser E2E against the embedded binary on `127.0.0.1:8081` | Built binary and Chromium |

`dev` and `preview` accept `--open`, `--locale <id>`, `--case <id-or-slug>`, `--language <lens>`, and `--mode guided|challenge|deep-dive`. The Case selector accepts all six published IDs and slugs. These options choose the browser URL when `--open` is present. `--include-drafts` enables explicitly requested draft routes; `--listen` controls the executable's address.

`check --locale` skips the general test suite and Code Lens compilers. `check --language` runs a focused language path; `--case` validates the selector but does not narrow the current Case metadata validator. `--docs` cannot be combined with other check options. A compiler pass is not proof of a Case's distributed correctness claim. See [testing](../testing/strategy.md) and [build details](../build/build.md).
