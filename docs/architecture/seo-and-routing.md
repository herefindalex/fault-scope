# Locale routing and search metadata

Human Locale is the first path segment: `/en/`,
`/ja/cases/should-you-send-it-again/`, and `/ar/languages/c/`.
Case and Code Lens slugs stay stable across locales. Case identity is the
canonical `fs-c01` ID, not a translated URL.

The root `/` is a lightweight entry page. With JavaScript, it chooses the
saved Human Locale, then browser languages, then English; its static locale
links still work without JavaScript. An explicit localized URL always renders
its own locale. The old unprefixed Case and language paths remain noindex
entry pages that redirect in the browser to a localized counterpart. Unknown
locale paths return an HTTP `404` from the embedded server.

Each localized page is statically exported with its own `<html lang>` and
direction. Page metadata includes title, description, Open Graph fields,
canonical URL, `hreflang` alternatives, and an `x-default` link to `/`.
English source pages are indexable and appear in the sitemap. The 19
incomplete, unreviewed beta locales have `noindex` and are omitted from the
sitemap until reviewed. No translated slug is generated.

Set `FAULTSCOPE_SITE_URL` to the public site origin **at build time** for
production absolute metadata and sitemap URLs. Without it, local builds use
`http://localhost:8080`; this repository has no configured public site
origin. See [localization](../localization/overview.md) and
[translation quality](../localization/quality-policy.md).
