import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ResultHandoff,
  downstreamWithoutCancellation,
  longWorkCheckCancel,
  precheckThenBlock,
} from "./case07.ts";

test("cancel must participate at the handoff, and late cancel is not rollback", async () => {
  const weakCancel = new AbortController();
  const weakHandoff = new ResultHandoff();
  const weak = precheckThenBlock(weakCancel.signal, weakHandoff, 21);
  assert.equal(weakHandoff.hasPending(), true);
  weakCancel.abort();
  assert.equal(weakHandoff.hasPending(), true);
  assert.equal(await weakHandoff.receive(), 42); // Cleanup the intentionally blocked send.
  await weak;

  const strongCancel = new AbortController();
  const strongHandoff = new ResultHandoff();
  const strong = strongHandoff.sendWithCancel(42, strongCancel.signal);
  assert.equal(strongHandoff.hasPending(), true);
  strongCancel.abort();
  await assert.rejects(strong, /CANCELLED/);
  assert.equal(strongHandoff.hasPending(), false);

  const readyCancel = new AbortController();
  const readyHandoff = new ResultHandoff();
  const receiving = readyHandoff.receive();
  await readyHandoff.sendWithCancel(42, readyCancel.signal);
  readyCancel.abort();
  assert.equal(await receiving, 42);

  assert.throws(() => longWorkCheckCancel(strongCancel.signal, 100000), /CANCELLED/);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  let finished = false;
  const downstream = downstreamWithoutCancellation(pending).then(() => { finished = true; });
  assert.equal(finished, false);
  release();
  await downstream;
  assert.equal(finished, true);
});
