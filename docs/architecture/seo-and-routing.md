# Locale routing and search metadata

Human Locale is the first path segment: `/en/`, `/ja/cases/can-the-old-worker-still-commit/`, and `/ar/languages/c/`. All three Case slugs and all Code Lens slugs stay stable across locales. Case identity uses canonical IDs `fs-c01`, `fs-c02`, and `fs-c03`, not translated URLs. `/{locale}/cases/` lists the published Cases. An unprefixed `/cases/{slug}/` remains a noindex language-selection entry page for each published Case.

The root `/` is a lightweight entry page. With JavaScript it chooses a saved Human Locale, then supported browser languages, then English; static locale links still work without JavaScript. An explicit localized URL always renders its own locale. Unknown locale paths return HTTP `404` from the embedded server.

Each localized page is statically exported with its own `<html lang>` and direction. Page metadata includes title, description, Open Graph fields, canonical URL, `hreflang` alternatives, and an `x-default` link to `/`. English source pages are indexable and appear in the sitemap. The 19 complete but unreviewed beta locales are `noindex` and omitted from the sitemap until reviewed. No translated Case slug is generated.

Set `FAULTSCOPE_SITE_URL` to the public site origin **at build time** for production absolute metadata and sitemap URLs. Without it, local builds use `http://localhost:8080`; the repository has no configured public site origin. See [localization](../localization/overview.md) and [translation quality](../localization/quality-policy.md).
