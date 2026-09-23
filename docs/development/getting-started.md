# How to build from a checkout

The production artifact is one Go executable. Building it needs the frontend
toolchain; running it does not.

## Prerequisites

- **Core contributor:** Go 1.22 or newer, Node 24, pnpm 12, and Git.
- **Translation contributor:** Go for catalog validation; Node 24 and pnpm 12
  only when previewing in the browser.
- **Code Lens contributor:** Go plus the toolchain for the lens being checked.
  TypeScript validation also uses the web dependencies and Node 24.
- **Maintainer running `check --all`:** Python 3, Java (`javac` and `java`),
  PHP, a C11 compiler (`cc`), and a C++17 compiler (`c++`) in addition to
  the core tools.

Install only the toolchains required for the layer you are changing.

## Build and run

From the repository root:

```bash
go run ./tools doctor
pnpm --dir web install --frozen-lockfile
go run ./tools check
go run ./tools build
./dist/faultscope
```

Open `http://localhost:8080/`. The default `:8080` binds all interfaces;
pass `--listen 127.0.0.1:8080` to restrict the server to loopback. The
build produces `dist/faultscope` (or `dist/faultscope.exe` on Windows).
The build checks content and catalogs, then exports the frontend and embeds
it. `check` runs the Go and frontend tests. For a production-shaped local
run with one command, use `go run ./tools preview --open`.

## Verify

`go run ./tools smoke` exercises the built executable's routes, assets,
headers, metadata, and shutdown. `GET /healthz` returns `ok` while it runs.
To exercise all 20 locales in a browser against the built binary, run
`pnpm --dir web e2e`. Install Playwright Chromium first, or set
`FAULTSCOPE_CHROME_PATH` to an installed Chrome executable. The E2E runner
starts the binary on `127.0.0.1:8081` and shuts it down after the tests.
See [commands](commands.md) for focused checks and
[troubleshooting](../operations/troubleshooting.md) if a tool is missing.
