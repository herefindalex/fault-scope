# Developer commands

Run these from the repository root with `go run ./tools ...`. The Go tool
orchestrates the build and checks; it does not replace the language toolchains.

| Command | Purpose and output | Prerequisites |
| --- | --- | --- |
| `doctor` | Reports paths for Go, Node, pnpm, Git; requires Node 24 and pnpm 12 | Core tools |
| `generate` | Extracts marked Code Lens regions into ignored `web/src/generated/snippets.json` | Go, seven source files |
| `dev` | Generates snippets, watches source regions, starts Next.js development server on its default port 3000 | Go, Node 24, pnpm 12, installed web dependencies |
| `preview` | Builds and starts the production-shaped Go executable | Build prerequisites |
| `check` | Validates docs, snippets, Case, locales; runs Go tests, frontend typecheck, formatting, and tests | Core tools and installed web dependencies |
| `check --all` | Runs `check`, then validates all seven Code Lens toolchains and fixtures | Full toolchain set |
| `check --docs` | Checks local Markdown targets and docs index coverage only | Go |
| `check --locale ja` | Validates the selected Human Locale catalog only | Go |
| `check --case fs-c01 --language cpp` | Generates snippets, validates Case metadata, and checks one Code Lens | Go and selected language toolchain |
| `build` | Creates `dist/faultscope` with static content embedded | Go, Git, Node 24, pnpm 12, installed web dependencies |
| `smoke` | Probes an existing `dist/faultscope` binary and its embedded manifest | Built binary |
| `pnpm --dir web e2e` | Runs browser E2E against the embedded binary on `127.0.0.1:8081` | Built binary, Node 24, pnpm 12, Chrome or Playwright Chromium |

`dev` and `preview` accept `--open`, `--locale <id>`, `--case fs-c01`,
`--language <lens>`, and `--mode guided|challenge|deep-dive`. These options
choose the browser URL only when `--open` is present. `dev --include-drafts`
exposes draft Cases for local development; `preview` rejects it. `preview`
accepts `--listen <address>` for its Go server. Although the shared parser
currently accepts `--listen` for `dev`, Next.js still uses its default
development address; do not use that flag to configure the dev server.

`check --locale` skips the general test suite and Code Lens compilers.
`check --language` runs its focused path; `--case fs-c01` alone runs the
general suite because only one Case exists. `--docs` cannot be combined with
other check options. Validation does not turn a compiler pass into proof of
the Case's distributed correctness claim. See [testing](../testing/strategy.md)
and [build details](../build/build.md).
