import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ackBeforeEffect,
  applyEventOnce,
  handleRewardDelivery,
  newRewardStore,
  splitRewardAndMarker,
  weakEffectThenAck,
} from "./case04.ts";

test("delivery repeats but an atomic protected effect does not", () => {
  const weak = newRewardStore();
  const weakAck = { accepted: new Set<string>() };
  weakEffectThenAck(weak, weakAck, "E", "User42", 100, true);
  assert.equal(weakAck.accepted.has("E"), false);
  weakEffectThenAck(weak, weakAck, "E", "User42", 100, false);
  assert.equal(weak.state.balance.get("User42"), 200);

  const ackFirst = newRewardStore();
  const firstAck = { accepted: new Set<string>() };
  ackBeforeEffect(ackFirst, firstAck, "E", "User42", 100, true);
  assert.equal(firstAck.accepted.has("E"), true);
  assert.equal(ackFirst.state.balance.get("User42") ?? 0, 0);

  const strong = newRewardStore();
  assert.equal(applyEventOnce(strong, "E", "User42", 100), true);
  assert.equal(applyEventOnce(strong, "E", "User42", 100), false);
  assert.equal(strong.state.balance.get("User42"), 100);
  const strongAck = { accepted: new Set<string>() };
  handleRewardDelivery(strong, strongAck, "E", "User42", 100);
  assert.equal(strong.state.balance.get("User42"), 100);
  assert.equal(strongAck.accepted.has("E"), true);

  const split = newRewardStore();
  const marker = new Set<string>();
  splitRewardAndMarker(split, marker, "E", "User42", 100, true);
  splitRewardAndMarker(split, marker, "E", "User42", 100, false);
  assert.equal(split.state.balance.get("User42"), 200);
});
