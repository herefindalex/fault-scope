# ADR 0001: One Go binary with an embedded static frontend

**Status:** implemented

## Context

The interactive site is authored in Next.js/React, while the production
runtime is Go. Shipping independently versioned frontend files could pair
the wrong Case content with a runtime artifact.

## Decision

Export the frontend statically at build time. Copy the clean export into the
Go embed stage, record a content hash and matching executable metadata, and
ship one Go binary. Node and pnpm are build dependencies only.

## Consequences

Deployment and rollback involve one artifact, and startup detects a mismatched
bundle. A content or translation change requires a rebuild. The executable
is larger, and the build still needs the frontend toolchain. See
[single-binary rationale](../architecture/single-binary.md),
[provenance](../architecture/build-provenance.md), and [build](../build/build.md).
