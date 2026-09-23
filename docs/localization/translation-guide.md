# How to contribute a translation

You can edit prose without learning the Go embed pipeline or installing all
seven programming-language compilers.

## 1. Find the content

The [locale registry](../../web/i18n/registry.json) holds ID, native and
English names, direction, and status. Shared UI strings live in
`web/i18n/messages/<locale>.json`. Case 01 strings live in
`web/content/cases/fs-c01/locales/<locale>.json`. English files are the
canonical source for required message keys and placeholders.

Keep `caseId`, `stepIds`, translation keys, and placeholders such as
`{operationId}` stable. Translate message values only. Do not translate
Case slugs or make locale-specific copies of Code Lens source. Use
[the terminology guide](style-guide.md) for correctness-sensitive wording.

## 2. Validate one locale

From the repository root:

```bash
go run ./tools check --locale ja
```

Replace `ja` with the locale ID. This checks registry metadata, required
shared keys, duplicate/unknown keys, placeholder parity, Case/step IDs, and
completeness required by the locale's status. It needs Go only. A beta
translation may omit messages; a reviewed one may not.

## 3. Preview

With Node 24 and pnpm 12 installed:

```bash
go run ./tools dev --open --locale ja --case fs-c01 --language cpp
```

Inspect Guided, Challenge, Deep Dive, long strings, selector labels, and
fallback markers. Development shows `[MISSING: key]` next to English for
missing beta messages. Production falls back at the message level; it does
not redirect the whole page to English. For Arabic, follow the [RTL
checklist](rtl.md). Finish with `go run ./tools check`.

## Troubleshooting

An unknown locale fails `--locale` validation. A changed or malformed
`{placeholder}` fails the catalog validator. If a reviewed locale fails for
missing content, complete the source key set and canonical step IDs before
keeping that status. See the [quality policy](quality-policy.md) and
[developer commands](../development/commands.md).
