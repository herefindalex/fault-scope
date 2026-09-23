# How to build the single executable

The build combines static frontend content and the Go runtime. Start with
the [development prerequisites](../development/getting-started.md), including
Node 24, pnpm 12, and installed `web/` dependencies.

## Steps

```bash
go run ./tools check
go run ./tools build
go run ./tools smoke
```

`build` performs these operations in order:

```text
Code Lens region extraction
→ Case and locale validation
→ remove old web/out and run Next.js static export
→ replace internal/webui/dist with exported files
→ hash exported paths and bytes, write faultscope-build.json
→ compile Go with bundled assets and matching linker metadata
→ dist/faultscope
```

The build generates `web/src/generated/snippets.json`, `web/out/`,
`internal/webui/dist/`, and `dist/faultscope` (with `.exe` on Windows).
These are ignored outputs. Do not edit them by hand. The build does not
run the seven Code Lens compiler suites; run `go run ./tools check --all`
when that coverage matters.

## Verification and troubleshooting

`smoke` starts the binary on a temporary loopback port. It checks localized
and legacy deep routes, unknown-route `404`, unsupported-method `405`,
hashed assets, metadata, and shutdown. A clean Git checkout gives the
manifest `dirty: false`; a build with uncommitted inputs is marked dirty.
For missing bundles or mismatch errors, see
[troubleshooting](../operations/troubleshooting.md). The build identity is
explained in [provenance](../architecture/build-provenance.md), the release
process in [release](release.md), and the runtime tradeoff in
[single binary](../architecture/single-binary.md).
