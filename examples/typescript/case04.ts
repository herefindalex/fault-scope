// The store operation models one authoritative transaction; a real store must
// commit the processed identity and protected mutation in one durable boundary.
export type RewardState = {
  balance: Map<string, number>;
  processed: Set<string>;
};
export type RewardStore = { state: RewardState };
export type DeliveryAck = { accepted: Set<string> };

export function newRewardStore(): RewardStore {
  return { state: { balance: new Map(), processed: new Set() } };
}

function add(store: RewardStore, userID: string, points: number): void {
  store.state.balance.set(
    userID,
    (store.state.balance.get(userID) ?? 0) + points,
  );
}

// faultscope:begin fs-c04.effect-then-ack
export function weakEffectThenAck(
  store: RewardStore,
  ack: DeliveryAck,
  eventID: string,
  userID: string,
  points: number,
  crashBeforeAck: boolean,
): void {
  add(store, userID, points); // Protected effect commits first.
  if (crashBeforeAck) return; // Broker may redeliver E.
  ack.accepted.add(eventID);
}
// faultscope:end fs-c04.effect-then-ack

// faultscope:begin fs-c04.ack-before-effect
export function ackBeforeEffect(
  store: RewardStore,
  ack: DeliveryAck,
  eventID: string,
  userID: string,
  points: number,
  crashAfterAck: boolean,
): void {
  ack.accepted.add(eventID);
  if (crashAfterAck) return; // ACK survives; reward may be lost.
  add(store, userID, points);
}
// faultscope:end fs-c04.ack-before-effect

// faultscope:begin fs-c04.apply-event-once
export function applyEventOnce(
  store: RewardStore,
  eventID: string,
  userID: string,
  points: number,
): boolean {
  if (store.state.processed.has(eventID)) return false;
  // Model one Rewards Store transaction with a single commit point.
  const next: RewardState = {
    balance: new Map(store.state.balance),
    processed: new Set(store.state.processed),
  };
  next.processed.add(eventID);
  next.balance.set(userID, (next.balance.get(userID) ?? 0) + points);
  store.state = next; // Identity and protected effect become visible together.
  return true;
}
// faultscope:end fs-c04.apply-event-once

// faultscope:begin fs-c04.redelivery-no-repeat
export function handleRewardDelivery(
  store: RewardStore,
  ack: DeliveryAck,
  eventID: string,
  userID: string,
  points: number,
): void {
  applyEventOnce(store, eventID, userID, points);
  ack.accepted.add(eventID); // D2(E) can finish without another +100.
}
// faultscope:end fs-c04.redelivery-no-repeat

// faultscope:begin fs-c04.separate-dedupe-record
export function splitRewardAndMarker(
  store: RewardStore,
  marker: Set<string>,
  eventID: string,
  userID: string,
  points: number,
  crashBeforeMarker: boolean,
): void {
  if (marker.has(eventID)) return;
  add(store, userID, points); // Separate reward durability boundary.
  if (crashBeforeMarker) return;
  marker.add(eventID);
}
// faultscope:end fs-c04.separate-dedupe-record
