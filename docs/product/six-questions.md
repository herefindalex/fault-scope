# The Six Questions

Use these questions when a caller sees an ambiguous result from a remote
operation. The questions are a reasoning aid, not a proof procedure.

1. **What was actually established?** In Case 01, the caller knows no
   completion response arrived before its deadline. It does not know whether
   a VM was created.
2. **What execution does the current contract still allow?** With no
   documented repeat protection, an initial attempt may create a VM and an
   independent retry may create another.
3. **What property must remain true?** One logical `CreateVM` operation must
   not create two VMs in this teaching model.
4. **Where is that property enforced?** A stronger synthetic receiver contract
   can bind compatible repeats carrying the same identity `P` to one logical
   operation, within a defined scope.
5. **Can the bad execution still occur?** Yes if the caller retries under a
   new identity `Q`, or if a protection assumption does not hold.
6. **What failure remains after repair?** The caller may lose `P` after a crash;
   retention, concurrent attempts, and reconciliation evidence still need
   defined contracts.

The same missing response can justify different next actions under different
contracts. A timeout alone does not answer the retry question.

Continue with the [Case 01 model](../cases/fs-c01.md) or the
[authoring guide](../cases/authoring-guide.md).
