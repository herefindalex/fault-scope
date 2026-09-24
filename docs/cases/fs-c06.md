# FS-C06: The Read Succeeded. Is It Fresh Enough?

## Contract

`Product42` begins at revision 43 with price 100. A price update commits at the authoritative store as revision 44 with price 120, and the caller receives `committed revision = 44`. The asynchronous projection is still at revision 43 with price 100. An immediate verification request receives HTTP 200 and that older projected state.

**Property:** A read requested with minimum revision `R` must not return a `Product42` state whose revision is below `R`. For this verification workflow, `R = 44`. Revision 45 would also satisfy the request; the contract is a lower bound, not an exact historical value.

The minimal counterexample has no broken component: the write commits at 44, the projection still has 43, and an ordinary projection read succeeds with 43. The failure appears only when the caller treats that HTTP success as satisfying the workflow's required minimum 44. Numerically, `43 < 44`.

A plain `ReadCurrentProjection(productID)` contract returns whatever the projection currently holds. It is suitable for a browsing workflow that explicitly accepts eventual reads. It cannot by itself confirm the caller's committed write.

A stronger conceptual API is `GetProduct(productID, minimumRevision)`. To report a successful result for that request, the returned revision must be at least the minimum. A system may wait for projection catch-up, fall back to an authoritative read, or return an explicit `NOT_FRESH_ENOUGH`. Those are policy choices; the revision bound is the common obligation. Every cache or intermediate layer that serves the request must participate in the same check.

## Controls and limits

- **Insufficient:** Required 44, projected 43: the API cannot claim a successful fresh-enough read.
- **Satisfied:** Required 44, projected 44: return the projected state.
- **Further progress:** Required 44, projected 45: return the newer state. Do not poll for `price == 120`; revision 45 may legitimately have price 125.
- **Eventual browsing:** With no minimum revision and an explicit eventual-read contract, returning revision 43 can be valid.
- **Arbitrary sleep:** A fixed delay is not evidence that the projection reached 44 without a bounded propagation contract.
- **Lost token:** If the caller discards the committed revision 44, its later read may lack the evidence needed to request the lower bound.
- **Cache scope:** A cache serving revision 43 after a deeper layer reached 44 still violates a request with minimum 44.
- **Remaining surface:** A response at revision 44 satisfies the caller's lower bound, but the authoritative source may already have committed revision 45. The contract does not promise the absolute latest state.

## Transfer

A customer profile update returns committed revision 81. A confirmation view reads projected revision 80. Under a confirmation contract requiring at least 81, that view cannot report a successful fresh-enough result. A later revision 82 would satisfy the lower bound. The caller must carry revision 81 through to the read, and every serving cache must enforce it.

## Six Questions

1. **Identity:** Which product does the read concern?
2. **Authority:** Which write assigns the committed revision token?
3. **Durability:** Has that write committed, and where is the token carried?
4. **Delivery:** How does the projection receive the committed change?
5. **Ordering:** Which projected revision is at least the required revision?
6. **Freshness:** Does this response meet this caller's lower bound?
