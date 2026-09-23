# Testing strategy

Each test layer answers a different question.

| Layer | Current check | What it establishes |
| --- | --- | --- |
| Go runtime | `go test ./...` | Routing, cache headers, manifest verification, shutdown behavior, and tool parsing |
| Frontend | `pnpm --dir web test`, typecheck, formatting | Case interactions, locale and Code Lens state, presentation code correctness |
| Browser E2E | `pnpm --dir web e2e` after `go run ./tools build` | All 20 public locales traverse Cases 01–03 from the embedded binary; Guided, Challenge, Deep Dive, visuals, navigation, and progress are exercised |
| Case and locale validation | `go run ./tools check` | IDs, required sections, catalog shape, placeholders, and public-locale completeness |
| Code Lens fixtures | `go run ./tools check --all` or focused `--language` | Each source compiles and synthetic weak/strong/scope fixtures execute |
| Embedded binary | `go run ./tools build` then `go run ./tools smoke` | Exported deep routes, assets, HTTP behavior, bundle metadata, and clean shutdown |
| Documentation | `go run ./tools check --docs` | Local Markdown targets and index coverage |

**Compilation proves syntax and toolchain validity; it does not prove a distributed correctness claim.** Case 01 fixtures cover independent weak-contract repeat, compatible `P → P`, and new-identity `P → Q`. Case 02 fixtures cover stale-generation rejection and current-generation progress. Case 03 fixtures cover the DB commit gap, shared durable intent, and relay duplicate possibility. Engineering review still needs to test whether the contract assumptions, counterexample, and repair are accurately stated.

The binary smoke test makes real HTTP requests against the embedded artifact. This is distinct from a Next.js development server and validates production packaging. See [content validation](content-validation.md), [Case authoring](../cases/authoring-guide.md), and [build](../build/build.md).
