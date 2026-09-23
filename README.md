# Faultscope

Faultscope is an interactive learning lab for distributed application correctness. Its first case, **Should You Send It Again?**, asks what a caller can justify after a `CreateVM` request receives no completion response. The lesson follows evidence, contract, and desired property rather than teaching a pattern name as a universal answer.

This repository is a **Case 01 preview (`0.0.x`)**. The three-case v0.1 scope is not complete. The synthetic examples are teaching models, not cloud SDKs or production VM clients.

## Run the single executable

Release builds embed the entire static site and content in one Go executable. They need no Node.js, database, external content directory, or network API at runtime.

```sh
go run ./tools build
./dist/faultscope
```

Open `http://localhost:8080/`. The server listens on all interfaces at `:8080` by default. Set `FAULTSCOPE_LISTEN=127.0.0.1:9090` or pass `--listen 127.0.0.1:9090`; the flag wins. `GET /healthz` and `GET /api/version` expose health and truthful embedded build metadata. SIGINT and SIGTERM trigger bounded graceful shutdown.

`go build ./cmd/faultscope` also works from a clean checkout. That development executable serves a clear placeholder. Use `go run ./tools build` or `go run ./tools preview` for the complete site.

## Contributor workflow

Use Go 1.22+ and **Node 24** with pnpm 12 for frontend work.

```sh
pnpm --dir web install --frozen-lockfile
go run ./tools dev --open       # Next.js development server and MDX editing
go run ./tools preview --open   # export, embed, build, run the actual Go server
go run ./tools check     # Go tests, content checks, frontend types and tests
go run ./tools check --all
go run ./tools check --case fs-c01 --language php
go run ./tools doctor
go run ./tools smoke     # after build: exercise the actual executable
```

Use `--case fs-c01 --language php --mode guided` with `dev` or `preview` to open a specific entry point. Development can expose draft cases with `dev --include-drafts`; production export includes published cases only.

`check --language` invokes only that language's reference toolchain. CI runs Go, TypeScript, Python, Java, PHP, C, and C++ checks independently. Each language fixture demonstrates an allowed two-VM execution under the weak contract, a one-VM `P → P` repeat under the stronger contract, and a two-VM `P → Q` scope failure.

## Architecture

- `cmd/faultscope` and `internal/server`: the single production HTTP process. Static routes return real 404s; unsupported methods return 405s. HTML revalidates, Next.js hashed assets are immutable, and health/version responses are not cached.
- `web`: React, TypeScript, Next.js App Router static export, and MDX. Next.js is build-time tooling only.
- `examples`: valid language source with semantic region markers. `go run ./tools generate` extracts those regions into the frontend. The language selector changes source display without changing Case 01 reasoning state.
- `tools`: cross-platform Go build orchestration. It cleans export staging before copying, hashes every exported path and byte in sorted order, writes a manifest, and embeds the bundle in the Go executable. Startup checks that bundle hash, version, commit, and dirty state match executable metadata.

Generated `web/out`, `web/src/generated`, `internal/webui/dist`, and `dist` are ignored. A release binary is built with `CGO_ENABLED=0`.

## Human locales

Localized static routes include `/en/`, `/ja/cases/should-you-send-it-again/`,
and `/ar/languages/c/`. Human Locale changes prose and layout; Code Lens
changes source code independently. English is the complete source locale.
The other 19 locale catalogs are beta and incomplete, with explicit English
fallback. See the [translation workflow](docs/i18n.md) for status, validation,
preview commands, and build-time SEO configuration.

## Case 01 scope

The teaching model says the caller received no completion response before its deadline and cannot establish that the request never left. World A has no VM; World B has a VM whose completion response is unavailable. Both fit the same local observation. The stated property is that one logical `CreateVM` operation must not create two VMs.

With no documented repeat protection, an independent repeat can violate that property. A stronger synthetic contract binds compatible repeats of identity `P` to the same logical operation, making `P → P` justifiable within its defined scope. `P → Q` is another operation and can still create two VMs. Case 01 also covers a positive completion path, a repeat-safe negative control, transfer to a charge operation, and remaining failures such as lost identity, retention windows, concurrent attempts, and limited reconciliation evidence.

There are no accounts, persistence service, analytics backend, arbitrary code execution, external cloud integrations, or general distributed-systems simulator. Code lens preference stays in the browser; an explicit `?lang=cpp` overrides the current visit without changing the saved preference.
