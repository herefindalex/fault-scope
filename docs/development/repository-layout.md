# Repository layout

The directories follow responsibility boundaries:

| Directory | Responsibility |
| --- | --- |
| `cmd/faultscope/` | Executable entry point, listen configuration, shutdown |
| `internal/server/` | Read-only HTTP routing and cache behavior |
| `internal/webui/` | Embedded static assets and development placeholder |
| `internal/buildinfo/` | Bundle manifest, content hash, startup verification |
| `tools/` | Development commands, generation, validation, build, smoke checks |
| `web/app/` | Next.js static routes and metadata |
| `web/components/` | Interactive learner interface |
| `web/src/` | Canonical Case IDs, state machine, generated snippet consumer |
| `web/i18n/` | Human Locale registry and shared UI messages |
| `web/content/cases/` | Case-specific locale prose |
| `examples/` | Seven Code Lens sources and behavioral fixtures |
| `docs/` | Contributor, product, architecture, and operations guides |

`web/src/generated/`, `web/out/`, `internal/webui/dist/`, and `dist/`
are ignored build outputs. Edit their source inputs, then regenerate. The
English catalogs define message keys; Case meaning remains in canonical
metadata and state rather than in a translated copy. See the
[Case model](../cases/README.md) and [architecture](../architecture/overview.md).
