import assert from "node:assert/strict";
import { test } from "node:test";
import { JobStore, commitCurrentWorker } from "./case02.ts";

test("stale generation cannot commit while current generation can", () => {
  const weak = new JobStore();
  weak.takeover(8); // B has not committed; still RUNNING.
  assert.equal(weak.storeResultWeak("A7"), true);
  assert.equal(weak.result, "A7");

  const gated = new JobStore();
  gated.takeover(8);
  assert.equal(gated.storeResultGated(7, "A7"), false);
  assert.equal(gated.result, null);
  assert.equal(commitCurrentWorker(gated, "B8"), true);
  assert.equal(gated.result, "B8");
});
