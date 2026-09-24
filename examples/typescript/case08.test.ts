import assert from "node:assert/strict";
import test from "node:test";
import {
  WeakRecoveryProjection,
  StrongRecoveryProjection,
  persistStateWithRevision,
  rebuildBeforeReady,
  type RecoveryStore,
} from "./case08.ts";

test("FS-C08 loses only the volatile guard, then recovers it coherently", () => {
  const weakStore: RecoveryStore = { record: { state: "", revision: 0 } };
  const before = new WeakRecoveryProjection(weakStore);
  assert.equal(before.apply({ state: "SHIPPED", revision: 44 }), true);
  assert.equal(before.apply({ state: "PROCESSING", revision: 42 }), false);
  assert.equal(weakStore.record.state, "SHIPPED");
  const after = new WeakRecoveryProjection(weakStore);
  assert.equal(after.apply({ state: "PROCESSING", revision: 42 }), true);
  assert.equal(weakStore.record.state, "PROCESSING");

  const strongStore: RecoveryStore = { record: { state: "", revision: 0 } };
  persistStateWithRevision(strongStore, { state: "SHIPPED", revision: 44 });
  const recovered = StrongRecoveryProjection.recover(strongStore);
  assert.equal(recovered.apply({ state: "PROCESSING", revision: 42 }), false);
  assert.deepEqual(strongStore.record, { state: "SHIPPED", revision: 44 });
  assert.equal(recovered.apply({ state: "DELIVERED", revision: 45 }), true);
  assert.deepEqual(strongStore.record, { state: "DELIVERED", revision: 45 });

  const rebuilt = rebuildBeforeReady([
    { state: "PROCESSING", revision: 42 },
    { state: "SHIPPED", revision: 44 },
  ]);
  assert.equal(rebuilt.apply({ state: "PROCESSING", revision: 42 }), false);
});
