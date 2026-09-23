# Release process

Builds currently label artifacts `0.0.1-preview`. Three canonical Cases are published, but the repository has no automated public release pipeline yet. Do not label a preview artifact `v0.1.0` until release review and packaging are complete.

For a preview candidate, start from a reviewed clean commit. Run `go run ./tools check --all`, `go run ./tools build`, `go run ./tools smoke`, and the browser E2E suite. Inspect `/api/version` and the embedded `faultscope-build.json`: version, commit, dirty state, content hash, Case IDs, and Code Lens IDs. The executable and embedded manifest must agree; startup rejects a mismatch.

Build each target platform's binary and publish checksums alongside an actual release. Platform packaging and checksum publishing are **release tasks, not existing repository automation**. Each platform binary should identify the same reviewed commit and intended static content. Changing a translation or frontend asset changes the content hash and requires rebuilding the binary. See [build steps](build.md), [provenance](../architecture/build-provenance.md), and [deployment](../operations/deployment.md).
