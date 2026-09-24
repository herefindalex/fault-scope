# FS-C07: Did Cancellation Stop the Work?

## Contract

A request-scoped producer checks cancellation, processes an item, then hands its result to an unbuffered channel. No receiver is waiting. The producer blocks in the send. Only then does the request get cancelled.

```go
if err := ctx.Err(); err != nil { return err }
result := process(item)
out <- result // no receiver; the send can block forever
```

**Property:** After request `R` is cancelled, request-scoped work must not remain indefinitely blocked on an operation with no cancellation path. This is a termination obligation at blocking boundaries, not a promise of instant stop or rollback.

The minimal counterexample is: the pre-check sees an active request; processing finishes; the send starts without a receiver; cancellation is requested and the signal becomes observable; the send never observes it. The cancellation signal worked. The producer is still blocked because this operation does not participate.

The stronger contract makes the handoff wait for whichever happens first: the result can be delivered, or cancellation becomes active. In Go, a `select` can listen to both the send and `ctx.Done()`. Other runtimes use their own cancellation-aware wait, interruptible queue operation, or explicit wake-up path. Checking a token before a blocking operation is not equivalent to making that operation cancellable.

## Controls and limits

- **Receiver ready:** A cancellation-aware handoff completes normally if a receiver is available. The repair does not suppress successful work.
- **Cancellation while blocked:** With no receiver, cancellation releases the producer from the handoff. A weak send stays blocked until the test supplies a receiver to clean it up.
- **Small bounded computation:** A short local operation need not check cancellation at every instruction. The concern is an operation that can block or run without a bound.
- **Long CPU work:** A cancellation-aware handoff cannot make an earlier long computation stop if that computation never cooperates.
- **Downstream API:** Cancellation does not cross an API boundary automatically. A downstream call that ignores the signal can keep running.
- **Detached work:** Intentionally detached work can have a different lifecycle owner. State that ownership explicitly rather than treating it as request-scoped.
- **No rollback:** Cancellation after a completed handoff or committed effect does not undo what already happened.
- **Remaining surface:** Every other blocking boundary needs its own termination path. FS-C08 asks what correctness state survives a process restart after that lifecycle ends.

## Transfer

A worker pool is shutting down while its result queue is full. Producers have finished computing, but their queue writes block. Which queue operation must participate in shutdown for request-scoped workers to terminate? Does merely checking a cancellation flag before the write suffice?

## Six Questions

1. **Identity:** Which request owns this producer and its result?
2. **Authority:** Who can cancel that request?
3. **Durability:** Which completed effects already survive cancellation?
4. **Delivery:** Can the result handoff wait indefinitely for a receiver?
5. **Ordering:** Did cancellation happen before or after the handoff completed?
6. **Lifecycle:** Which still-running operation can observe the signal and terminate?
