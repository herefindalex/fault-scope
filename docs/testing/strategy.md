# Testing strategy

Each test layer answers a different question.

| Layer | Current check | What it establishes |
| --- | --- | --- |
| Go runtime | `go test ./...` | Routing, cache headers, manifest verification, shutdown-related behavior and tool parsing |
| Frontend | `pnpm --dir web test`, typecheck, formatting | Case interactions, locale/Code Lens state, presentation code correctness |
| Case and locale validation | `go run ./tools check` | IDs, required sections, catalog shape, placeholders, and reviewed-locale completeness |
| Code Lens fixtures | `go run ./tools check --all` or focused `--language` | Each source compiles or passes syntax checking and its weak/strong/scope fixtures |
| Embedded binary | `go run ./tools build` then `go run ./tools smoke` | Exported deep routes, assets, HTTP behavior, bundle metadata, clean shutdown |
| Documentation | `go run ./tools check --docs` | Local Markdown targets and index coverage |

**Compilation proves syntax and toolchain validity. It does not by itself
prove the distributed correctness claim.** The fixtures cover the synthetic
contract's representative executions: an independent weak-contract repeat,
compatible `P → P`, and a new-identity `P → Q`. An engineering review still
needs to test whether the contract assumptions and counterexample are stated
accurately and whether a proposed repair closes the claimed failure path.

The binary smoke test uses real HTTP requests against the embedded artifact.
It is distinct from the Next.js development server, which does not validate
the production packaging. See [content validation](content-validation.md),
[Case authoring](../cases/authoring-guide.md), and [build](../build/build.md).
