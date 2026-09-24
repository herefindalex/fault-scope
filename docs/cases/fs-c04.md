# FS-C04: The Consumer Finished. Why Did It Run Again?

**Primary reasoning dimension:** delivery, acknowledgement, and repeated effects.

The logical event `E` requests a protected effect: add 100 points to User42's reward balance. The broker delivers `D1(E)`. The consumer commits the reward mutation, then crashes before the broker durably accepts its acknowledgement. Under a redelivery contract the broker sends `D2(E)`, and a weak consumer adds 100 again. Redelivery is expected behavior under that contract; the second protected effect is the violation.

## Contract

> One logical event `E` must not apply its protected reward effect more than once.

This property concerns the effect in the authoritative Rewards Store. It does not promise one delivery, one consumer execution, or one network call.

The minimal violating execution is `D1(E) → +100 commits → crash before durable ACK → D2(E) → +100 commits again`. A durable ACK before the effect merely moves the gap: a crash after ACK can leave the reward unapplied with no redelivery obligation.

The stronger contract gives `E` a stable identity and makes `ApplyEventOnce(E, User42, 100)` atomic at the Rewards Store. The store records that `E` was processed together with the reward mutation. The first delivery commits both; a redelivery finds `E` recorded and does not apply another 100. The consumer may then acknowledge the repeat delivery. Keeping the processed marker in a separate durability domain reopens the crash gap even when the ID is stable.

## Controls and limits

- A first delivery of a new `E` still adds 100.
- `D2(E)` may occur and finish without a second reward mutation.
- An operation such as `SetShipmentState(shipmentID, READY)` can be naturally repeat-safe under an explicit contract; it need not inherit the reward deduplication design.
- The repair covers this Rewards Store effect. It does not prove that the broker delivers once, that a consumer executes once, or that an arbitrary external side effect occurs once. The publisher must also preserve logical event identity across its own retries for `E` to remain the same event.

The Case-specific **Effect–Acknowledgement Timeline** distinguishes the logical event, each delivery, the committed effect, the acknowledgement gap, and redelivery. Guided mode walks through the weak trace, the ACK-first contrast, the atomic repair, positive and negative controls, the split-store scope challenge, inventory-reservation transfer, and a Six Questions recap. Challenge asks which evidence and enforcement boundary prevent the second `+100`; it does not ask learners to name an “idempotency pattern.”

The next Case asks a different question: when distinct events arrive in a different order from their authoritative revisions, which state should win?
