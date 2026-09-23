# Case 01: Should You Send It Again?

**Lifecycle:** published in the repository's Case metadata. **Model:** synthetic
`CreateVM` receiver and caller; no specific cloud provider is implied.

The caller sends attempt `A1` and receives **no completion response before its
deadline**. In this teaching model, transport cannot establish that the
request definitely never left. The observation fits at least two representative
worlds:

- **World A:** no VM was created.
- **World B:** a VM exists, but its completion response is unavailable.

The desired property is: **one logical `CreateVM` operation must not create two
VMs**. Under Contract A, there is no documented repeat protection and no
additional outcome evidence. An independent `A2` may create another VM even
if `A1` already created one. Keeping the operation unresolved is a defensible
immediate choice under this property; automatic resolution is not guaranteed.

Contract B is a stronger *synthetic* receiver guarantee. The caller assigns
stable identity `P` before `A1`. Compatible repeats carrying `P` represent
the same logical operation, and the receiver does not create a second VM for
`P` within its defined scope. Thus `P → P` can make progress without a
duplicate. `P → Q` crosses the identity boundary and can still create two VMs
while the receiver honors its contract for each identity.

The lesson also uses a repeat-safe desired-state operation as a negative
control, and transfers the identity question to a synthetic charge operation.
Contract B leaves retention windows, lost `P` after a crash, incompatible
parameter reuse, hidden retries/concurrency, and reconciliation evidence
unsettled. In particular, an eventually consistent `NOT_FOUND` query need not
prove that the original effect did not occur.

Read the [Six Questions](../product/six-questions.md), the
[Case model](README.md), and [Code Lens anchors](../code-lenses/semantic-anchors.md).
