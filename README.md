# FaultScope

**Interactive learning lab for distributed application correctness.**

FaultScope helps engineers reason from evidence, contracts, properties, authority, durability, and failure boundaries. Each Case asks what a system actually guarantees before naming a repair pattern.

## Explore the Cases

1. [Should You Send It Again?](docs/cases/fs-c01.md) — A `CreateVM` request returns no completion response. Decide what a retry can establish.
2. [Can the Old Worker Still Commit?](docs/cases/fs-c02.md) — Worker B takes over, but Worker A may resume. Find where authority to commit must be enforced.
3. [The Database Committed. Where Is the Event?](docs/cases/fs-c03.md) — A database commit survives a crash before broker publication. Find which publication obligation must be durable.

Each Case has **Guided**, **Challenge**, and **Deep Dive** modes, a Case-specific visual, an Evidence / Contract / Property rail, a positive control, a remaining failure surface, and seven Code Lenses. Progress is stored per Case in the browser.

Run a released binary with `./faultscope`, or build the current preview:

```bash
go run ./tools build
./dist/faultscope
```

Open [http://localhost:8080/](http://localhost:8080/). The default `:8080` binds all interfaces. Use `./dist/faultscope --listen 127.0.0.1:9000` or `FAULTSCOPE_LISTEN=127.0.0.1:9000 ./dist/faultscope` for a different address; the flag takes precedence. See [getting started](docs/development/getting-started.md) for Node 24, pnpm 12, and source-build setup.

## Current status

This is a **`0.0.x` preview** with three published Cases. The VM, Job Store, order, and broker examples are synthetic teaching models, not production SDK clients or infrastructure.

All 20 Human Locales have complete UI and Case 01–03 message catalogs. The 19 non-English catalogs are **unreviewed beta translations**. Human Locale changes the explanation and layout; Code Lens changes the source representation. They are independent: for example, 繁體中文 + Go or العربية + C. The seven Code Lenses are **Go, TypeScript, Python, Java, PHP, C, and C++**.

The Next.js/React frontend is statically exported and embedded in one Go executable. Production needs no Node server, database, content directory, or translation service. Learner progress and preferences live only in the browser.

## Documentation and contributing

Start at the [documentation index](docs/README.md), or choose a path:

- [Case authors](docs/cases/authoring-guide.md)
- [Translation contributors](docs/localization/translation-guide.md)
- [Code Lens contributors](docs/code-lenses/contributing.md)
- [Frontend and Go contributors](docs/development/getting-started.md)
- [Architecture](docs/architecture/overview.md)
- [Contributing guide](CONTRIBUTING.md)
- [繁體中文概覽](README.zh-TW.md)

FaultScope is licensed under the [MIT License](LICENSE).
