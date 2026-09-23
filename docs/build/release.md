# Release process

The build currently labels artifacts `0.0.1-preview`. There is no automated
published release pipeline in this repository yet. The intended `v0.1.0`
scope contains three canonical Cases; only Case 01 is currently published,
so do not label today's artifact `v0.1.0`.

For a preview candidate, start from a reviewed clean commit. Run
`go run ./tools check --all`, `go run ./tools build`, and
`go run ./tools smoke`. Inspect `/api/version` and the embedded
`faultscope-build.json` for the version, commit, dirty state, content hash,
Case IDs, and Code Lens IDs. The executable and embedded manifest must agree;
startup rejects a mismatch.

Build each target platform's binary and publish checksums alongside it when
creating an actual release. Platform packaging and checksum publishing are
**release tasks, not existing repository automation**. Every platform binary
should identify the same reviewed commit and intended static content.
Changing a translation or frontend asset changes the content hash and
requires a rebuilt binary. See [build steps](build.md),
[provenance](../architecture/build-provenance.md), and
[deployment](../operations/deployment.md).
