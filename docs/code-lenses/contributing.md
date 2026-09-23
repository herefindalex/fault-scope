# How to contribute to a Code Lens

Each Code Lens source is a valid file under `examples/`, with a nearby test.
Current sources include `examples/go/create_vm.go`,
`examples/php/CreateVm.php`, and `examples/cpp/create_vm.cpp`.
Use idiomatic code for the language while preserving the Case's semantic
decision.

## 1. Keep semantic regions

In the Go example, a region begins with:

```go
// faultscope:begin fs-c01.retry-independent-attempt
func RetryIndependent(ctx context.Context, client Client, spec VM) error {
    // ...
}
// faultscope:end fs-c01.retry-independent-attempt
```

Use the comment syntax appropriate to the language, but keep the
`faultscope:begin` / `faultscope:end` marker text and Case-namespaced
anchor identical. The generator rejects unknown, nested, duplicate, missing,
or mismatched regions. Anchors name a decision, not a line number: source
refactoring may move code without changing semantic identity.

## 2. Preserve the behavioral distinctions

The weak contract allows two VMs after an independent repeat. Compatible
`P → P` under the stronger synthetic contract yields one VM, while `P → Q`
can yield two. Review the [Case model](../cases/fs-c01.md) before changing
source or fixtures. Keep comments minimal and technical; Human Locale prose
belongs in translation catalogs, not copies of source files.

## 3. Run focused validation

With the relevant compiler/interpreter installed:

```bash
go run ./tools check --case fs-c01 --language php
```

Replace `php` with `go`, `typescript`, `python`, `java`, `c`, or `cpp`.
The command regenerates snippets, validates Case metadata, and runs that
lens's actual syntax and behavioral checks. For shared behavior changes,
run `go run ./tools check --all` and the [binary smoke test](../build/build.md).

## Troubleshooting

If generation reports a missing anchor, compare marker spelling with
`tools/snippets.go` and [semantic anchors](semantic-anchors.md). A missing
compiler affects only that lens's focused check; see
[developer prerequisites](../development/getting-started.md).
