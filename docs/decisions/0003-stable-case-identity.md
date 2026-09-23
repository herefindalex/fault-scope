# ADR 0003: Locale-neutral Case identity and stable slugs

**Status:** implemented for Case 01

## Context

Translated slugs would make one Case have multiple URL identities and would
complicate progress sharing, direct links, and static export.

## Decision

Case 01 uses canonical ID `fs-c01`, slug `should-you-send-it-again`, and
stable step/question/option IDs for every Human Locale. Locale files provide
wording, not a separate Case reducer or a translated slug.

## Consequences

`/ja/cases/should-you-send-it-again/` is an intentional route. The URL is
partly English even when the page is not. Authors must keep semantic IDs
stable and review translation meaning separately. See
[Case model](../cases/README.md),
[routing](../architecture/seo-and-routing.md), and
[authoring](../cases/authoring-guide.md).
