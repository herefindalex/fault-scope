# Human Locale and Code Lens

**Human Locale is independent of Code Lens.** Human Locale chooses prose, metadata, and document direction. Code Lens chooses one of seven source representations of the same Case decision. Supported combinations include 繁體中文 + Go, 日本語 + C++, Español + PHP, and العربية + C. Neither selection changes the canonical Case ID, step, answers, or semantic anchors.

Localized routes begin with the locale ID, such as `/zh-TW/` or `/ja/cases/can-the-old-worker-still-commit/`. The root route chooses a saved `faultscope.v1.locale` preference, then a supported browser language, then English. An explicit localized URL wins over a saved preference. Browser language does not infer Code Lens. Code Lens has a separate `faultscope.v1.codeLens` preference and optional `?lang=php` visit override. Locale switching preserves the query string and per-Case progress.

The [registry](../../web/i18n/registry.json) lists 20 locales. English is the source locale. Every locale has complete shared UI and Case 01–03 catalogs. The 19 non-English locales are **unreviewed beta translations**. Arabic uses RTL document layout; source code stays LTR.

See the [translation guide](translation-guide.md), [quality policy](quality-policy.md), [terminology style guide](style-guide.md), [RTL guidance](rtl.md), and [SEO and routing](../architecture/seo-and-routing.md).
