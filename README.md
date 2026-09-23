# Faultscope

**Interactive learning lab for distributed application correctness.**

Faultscope helps engineers reason from evidence, contracts, properties, authority,
durability, and failure boundaries. The lesson is the reasoning, not a list of
reliability pattern names.

## Try the first case

A remote `CreateVM` request returns no completion response before the caller's
deadline. Should the caller send it again? Case 01 lets you inspect the code,
compare possible executions, and see why the answer depends on the receiver's
contract. Choose **Guided**, **Challenge**, or **Deep Dive**.

Run a released binary with `./faultscope`, or build the current preview:

```bash
go run ./tools build
./dist/faultscope
```

Open [http://localhost:8080/](http://localhost:8080/). The default `:8080`
binds all interfaces. Use `./dist/faultscope --listen 127.0.0.1:9000` or
`FAULTSCOPE_LISTEN=127.0.0.1:9000 ./dist/faultscope` for a different address;
the flag takes precedence. See [getting started](docs/development/getting-started.md)
for Node 24, pnpm 12, and source-build setup.

## Current status

This is a **`0.0.x` preview**. **Case 01 is published** in this repository's
content lifecycle. Additional cases for the intended three-case `v0.1.0` scope
are not implemented. Its VM and payment examples are synthetic teaching models,
not production SDK clients.

Human Locale changes explanations and layout. Code Lens changes the source
representation. They are independent: for example, 繁體中文 + Go or العربية + C.
There are 20 Human Locales with locale-prefixed routes; English is complete,
while the other 19 are
**unreviewed beta translations with English message fallback**. The seven Code
Lenses are **Go, TypeScript, Python, Java, PHP, C, and C++**.

The frontend is built with Next.js/React as a static export. The build supports
MDX, while current Case 01 prose lives in locale JSON catalogs. The static
bundle is embedded into one Go executable. Production needs no Node server,
database, content directory, or translation service. Learner progress and
preferences live only in the browser.

## Documentation and contributing

Start at the [documentation index](docs/README.md) or choose a path:

- [Case authors](docs/cases/authoring-guide.md)
- [Translation contributors](docs/localization/translation-guide.md)
- [Code Lens contributors](docs/code-lenses/contributing.md)
- [Frontend and Go contributors](docs/development/getting-started.md)
- [Architecture](docs/architecture/overview.md)
- [Contributing guide](CONTRIBUTING.md)
- [繁體中文概覽](README.zh-TW.md)

Faultscope is licensed under the [MIT License](LICENSE).
