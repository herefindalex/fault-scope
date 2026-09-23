# How to contribute a translation

You can edit prose without learning the Go embed pipeline or installing all seven programming-language compilers.

## 1. Find the content

The [locale registry](../../web/i18n/registry.json) holds each locale's ID, names, direction, and status. Shared UI strings live in `web/i18n/messages/<locale>.json`. Case strings live in `web/content/cases/fs-c01/locales/<locale>.json`, `fs-c02/locales/`, and `fs-c03/locales/`. The corresponding English files are the canonical sources for required message keys and placeholders.

Keep `caseId`, `stepIds`, translation keys, and placeholders such as `{operationId}` stable. Translate message values only. Do not translate Case slugs or create locale-specific Code Lens source. Preserve technical identifiers such as `RUNNING`, `Order42`, `Event E`, and `StoreResult` when the lesson relies on matching them to code or the visual. Use the [terminology guide](style-guide.md) for correctness-sensitive wording.

## 2. Validate one locale

From the repository root:

```bash
go run ./tools check --locale ja
```

Replace `ja` with the locale ID. The command checks registry metadata, required shared and Case keys, duplicate or unknown keys, placeholder parity, Case and step IDs, and completeness required by the locale's status. It needs Go only. Every public locale, including beta locales, must provide every shared UI and published Case message.

## 3. Preview the lesson

With Node 24 and pnpm 12 installed:

```bash
go run ./tools dev --open --locale ja --case fs-c02 --language cpp
```

Inspect every Guided step, Challenge, Deep Dive, long strings, visual labels, and selector labels. For Arabic, follow the [RTL checklist](rtl.md). Finish with `go run ./tools check`; a runtime English fallback is only a defensive safeguard and does not satisfy public-locale completeness.
If a development server is already running when you edit Case 02 or 03 copy, run `go run ./tools generate` to refresh its combined catalog map before reloading the page.

An unknown locale fails `--locale` validation. A changed or malformed placeholder fails catalog validation. Complete the source key set and canonical step IDs before retaining a reviewed status. See the [quality policy](quality-policy.md) and [developer commands](../development/commands.md).
