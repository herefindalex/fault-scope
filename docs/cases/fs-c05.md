# FS-C05: Which Event Is Actually Newer?

## Contract

The authoritative source emits changes for `Shipment42` in this order:

| Event | Source revision | State |
| --- | ---: | --- |
| E42 | 42 | PROCESSING |
| E43 | 43 | SHIPPED |

The projection receives E43 before E42. A handler that applies every arrival first projects `SHIPPED` at revision 43, then overwrites it with `PROCESSING` at revision 42. The later arrival is the older authoritative state.

**Property:** Once the projection for `Shipment42` has applied an authoritative revision, an older revision must not replace it. The property concerns one entity stream, not a global order across all shipments.

The weak handler uses arrival as its only ordering evidence:

```text
on delivery(event):
    projection.state = event.state
```

The counterexample needs only two deliveries: E43 arrives and commits, then E42 arrives and commits. The final state regresses to `PROCESSING`.

The stronger contract comes from the source: within one shipment stream, revisions are unique and monotonically increasing, and a larger revision supersedes a smaller one. The projection stores both `projected_state` and `applied_revision`. It compares the incoming revision with the stored revision and commits both fields in one atomic mutation:

```text
if incoming.revision > projection.applied_revision:
    projection.state = incoming.state
    projection.applied_revision = incoming.revision
else:
    leave the projection unchanged
```

The comparison is meaningful because of the source contract. A field called `version` does not establish order by itself. A timestamp is also insufficient unless its producer and clock contract give it the required ordering semantics.

## Controls and limits

- **Stale arrival:** Apply E43, then deliver E42. Reject E42; the projection stays at revision 43 and `SHIPPED`.
- **Forward progress:** Deliver E44 after E43. If the source says revision 44 supersedes 43, advance state and revision together.
- **Duplicate:** Deliver the same E43 again. Equal revision does not regress the projection.
- **Entity scope:** `Shipment42` revision 43 and `Shipment99` revision 100 belong to different streams. Comparing their numbers does not establish a cross-shipment order.
- **Multiple writers:** Independent producers cannot merely choose larger numbers and claim one authoritative order. They need a shared revision assignment contract.
- **Epoch or reset:** If revisions reset, plain integer comparison may reject a genuinely newer state. The source must define how epochs compare or preserve monotonic revisions across resets.
- **Order-independent negative control:** A set union of shipment tags is commutative. If the property only concerns the final tag set, E42 and E43 can arrive in either order without this state-regression problem. Do not add revision rejection to a consumer that has no ordering-dependent property.
- **Remaining failure surface:** A projection at revision 43 does not regress when an older event arrives, but it may still be behind an authoritative revision 50. FS-C06 asks whether a successful read is fresh enough.

## Transfer

A customer profile source emits revision 108 with an old email, then revision 109 with a new email. The projection receives 109 before 108. Under the source's monotonic per-profile revision contract, 108 must not overwrite 109. The same conclusion does not follow from unrelated producer-local counters without a shared order.

## Six Questions

1. **Identity:** Which shipment stream does the event describe?
2. **Authority:** Which source assigns revisions for that stream?
3. **Durability:** Are projected state and applied revision committed together?
4. **Delivery:** Can an older or duplicate event arrive after a newer one?
5. **Ordering:** Which source-defined revision supersedes which?
6. **Freshness:** Even if the projection never regresses, is it current enough for this read?
