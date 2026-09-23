# Troubleshooting

| Symptom | Check and remedy |
| --- | --- |
| `bind: address already in use` | Choose another address with `--listen 127.0.0.1:9000` or stop the process using the port. |
| `Node 24 required` or `pnpm 12 required` | Put the requested toolchain on `PATH`, then run `go run ./tools doctor`. Node 24 is required for this web build. |
| Next.js cannot import `generated/snippets.json` | Run `go run ./tools generate` before direct frontend commands. `go run ./tools dev` and `build` do this automatically. |
| Browser shows stale content after a build | Rebuild with `go run ./tools build`, restart `./dist/faultscope`, and reload. Generated export and embed staging are replaced during build. |
| `missing <anchor> for <language>` | Check the matching `faultscope:begin`/`faultscope:end` regions in the source file and the canonical anchor list in `tools/snippets.go`. |
| `placeholder mismatch` or `required translation missing` | Compare the locale file with the English source. Preserve `{placeholder}` names; complete every source key before marking a locale `reviewed`. |
| Focused Code Lens check cannot find `javac`, `php`, `cc`, or another compiler | Install only the selected lens's toolchain or run a different focused check. `check --all` needs every toolchain. |
| `embedded bundle metadata does not match executable` or `embedded bundle content hash mismatch` | Rebuild the executable and embedded assets together with `go run ./tools build`; do not splice generated stages or binaries from different commits. |
| A direct localized URL returns `404` | Confirm the locale is public (not `draft`), the Case is published, and the path has a trailing slash. The Go server serves exported files exactly and has no SPA fallback. |

For source setup see [getting started](../development/getting-started.md).
For exact HTTP behavior see [runtime contract](../architecture/runtime-contract.md);
for locale status see [quality policy](../localization/quality-policy.md).
