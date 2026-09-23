# Build provenance

`go run ./tools build` exports the frontend, copies it into a clean embedding
stage, and writes `faultscope-build.json`. The manifest records schema version,
preview version, Git commit, dirty state, content hash, published Case IDs,
and Code Lens IDs. The current version constant is `0.0.1-preview`.

The content hash is SHA-256 over sorted exported paths and their bytes,
excluding the manifest itself. This means changing a Japanese Case sentence
changes the static export and the embedded `content_hash`. At startup, the Go
executable checks manifest version/commit/dirty fields against linker-set
metadata and recomputes the content hash. A mismatch stops startup. A plain
development `go build ./cmd/faultscope` has truthful `dev`/`unknown` metadata
and serves a placeholder instead of claiming to be a bundled release.

The invariant is: **executable metadata and embedded content metadata describe
the same build**. It prevents an old frontend bundle from being silently
paired with a newly labeled backend binary. Build from a clean commit for
`dirty: false`. Generated stages and binaries are ignored by Git.

`GET /api/version` exposes version, commit, content hash, and counts of Cases
and Code Lenses; it does not expose the full manifest. See the
[build guide](../build/build.md), [release guide](../build/release.md), and
[single-binary rationale](single-binary.md).
