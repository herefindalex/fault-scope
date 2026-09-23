# Human Locale and Code Lens

**Human Locale is not Code Lens.** Human Locale chooses prose, metadata, and
document direction. Code Lens chooses one of seven source representations of
the same Case decision. Supported combinations include 繁體中文 + Go,
日本語 + C++, Español + PHP, and العربية + C. Neither selection changes the
canonical Case ID, step, answers, or semantic anchors.

Localized routes begin with a locale ID: `/zh-TW/` or
`/ja/cases/should-you-send-it-again/`. The root `/` chooses a saved
`faultscope.v1.locale` preference, then a supported browser language, then
English. A localized URL is explicit and wins over a stale saved preference.
Browser language is never used to infer Code Lens. Code Lens has its own
`faultscope.v1.codeLens` preference and optional `?lang=php` visit override.
Locale switching preserves the query string and canonical Case progress.

The [registry](../../web/i18n/registry.json) currently lists 20 locales.
English is the source locale. All 20 locales have complete UI and Case 01 catalogs. The 19 non-English locales are **unreviewed beta translations**. Arabic uses RTL document layout, while source code stays LTR.

See the [translation guide](translation-guide.md),
[quality policy](quality-policy.md), [terminology style guide](style-guide.md),
and [RTL guidance](rtl.md). Routing and indexing details live in
[SEO and routing](../architecture/seo-and-routing.md).
