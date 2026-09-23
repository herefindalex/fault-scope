# ADR 0002: Human Locale and Code Lens are independent

**Status:** implemented

## Context

A learner may need Japanese prose and C++ source, or Arabic prose and C
source. Treating both as one language setting would multiply lesson copies
and couple unrelated preferences.

## Decision

Human Locale selects prose, metadata, and document direction. Code Lens
selects one of seven source representations. Each has separate browser state;
browser language can select only Human Locale. Both use the same Case IDs,
questions, state, and semantic decisions.

## Consequences

Any public locale can accompany any Code Lens. Translators do not edit source
fixtures, and Code Lens contributors do not translate prose. Tests and author
review must preserve semantic equivalence across both dimensions. See
[localization](../localization/overview.md) and
[Code Lenses](../code-lenses/overview.md).
