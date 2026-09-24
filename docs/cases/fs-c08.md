# FS-C08 — It Restarted. What Did It Forget?

## The decision

Shipment42 has reached `SHIPPED` at authoritative revision 44. Its business value is durable, but the projection's `lastAppliedRevision = 44` guard exists only in process memory. Before a crash, the guard rejects a delayed revision 42 event. After restart, the durable value still says `SHIPPED`, while the guard is empty. If the handler treats revision 42 as new, it writes `PROCESSING` and regresses the shipment.

The property is: **restart must not let an event older than the already-authoritative projected revision regress Shipment42.** A process being up is not evidence that it is ready to make this decision.

## Minimal violating execution

1. Apply revision 44: `Shipment42 = SHIPPED`; memory guard becomes 44.
2. Persist the business value, but not its revision guard.
3. Reject delayed revision 42 before the crash.
4. Crash and restart. The value survives; the guard does not.
5. Deliver revision 42, `PROCESSING`. An empty guard accepts it and the value regresses.

## Stronger contract and repaired execution

Store one coherent durable projection record: `{state: SHIPPED, applied_revision: 44}`. The state and the revision must advance atomically. A crash between unrelated writes could otherwise leave `state = SHIPPED, applied_revision = 43`, which does not describe one authoritative point. On recovery, restore both fields before accepting events or declaring the projection ready. Revision 42 is rejected; revision 45 is accepted and atomically advances both fields.

The Code Lens fixtures model serialized event application and an atomic durable-record write. They isolate the restart boundary; the source-order and concurrency contract remains the one established in [Case 05](fs-c05.md).

There is another valid contract: replay an authoritative, complete history to reconstruct both the value and its correctness metadata **before** serving reads or applying new events. Replay must itself be safe for repeated work. This case does not require persisting every variable. A disposable display cache can be rebuilt from authoritative state and need not be durable.

## Challenge and controls

The challenge shows `SHIPPED`, an empty post-restart guard, and incoming revision 42. Ask which evidence the restarted process has for rejecting revision 42. Under the weak design, it has none: the surviving business value does not encode the ordering decision.

The positive control is a recovered revision 44 accepting revision 45. The negative control is a display cache that can be rebuilt from the authoritative record. A separate projection snapshot at revision 44 and checkpoint at revision 43 is not automatically coherent: replay can repeat work, and a mismatched snapshot/checkpoint pair may describe different logical points.

## Transfer

A payment importer has durable account state through offset 500, but its memory-only recovery checkpoint resets to zero. Before replay from zero, establish a repeat-safe effect protocol or recover a coherent state/checkpoint pair. The fact that account data survived is not enough to justify replaying effects.

## Remaining failure surface

Recovery can still fail if the authoritative replay source is incomplete, a state/checkpoint pair diverges, or a new binary cannot interpret old durable bytes. A snapshot by itself and a checkpoint by itself do not establish the recovery contract. External effects do not reconstruct automatically. Schema compatibility belongs in the Deep Dive, not in the core counterexample.

## Six Questions and series close

1. **Evidence:** What proves the previously applied revision?
2. **Authority:** Which history or durable record is authoritative after restart?
3. **Durability:** Which value and correctness metadata survived together?
4. **Delivery:** What work may replay, and can its effect repeat safely?
5. **Ordering:** Which revision supersedes the incoming event?
6. **Recovery:** What must be restored or reconstructed before readiness?

Across the series, the boundaries are evidence, authority, durability, delivery, ordering, freshness, lifecycle, and recovery. A happy-path value surviving a crash does not prove correctness. The evidence and protocol state needed to preserve the invariants must survive or be safely reconstructed at the next boundary.
