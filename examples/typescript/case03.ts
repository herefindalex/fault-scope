export type OrderDb = {
  confirmed: boolean;
  outboxPending: boolean;
  outboxSent: boolean;
};
export type Broker = { publish(event: string): Promise<void> };

// faultscope:begin fs-c03.split-dual-write
export async function confirmThenPublish(db: OrderDb, broker: Broker): Promise<void> {
  db.confirmed = true; // Separate durable DB commit.
  await broker.publish("E"); // A crash before this leaves no durable obligation.
}
// faultscope:end fs-c03.split-dual-write

// faultscope:begin fs-c03.business-state-commit
export function commitBusinessStateOnly(db: OrderDb): void {
  db.confirmed = true; // No broker event or publication intent is committed here.
}
// faultscope:end fs-c03.business-state-commit

// faultscope:begin fs-c03.durable-publication-intent
export function confirmWithOutbox(db: OrderDb, rollback: boolean): void {
  const next = { ...db }; // Synthetic single-DB transaction.
  next.confirmed = true;
  next.outboxPending = true; // Event E publication obligation.
  if (rollback) throw new Error("transaction rolled back");
  Object.assign(db, next); // Both facts become authoritative together.
}
// faultscope:end fs-c03.durable-publication-intent

// faultscope:begin fs-c03.relay-publish
export async function relayPublishPending(db: OrderDb, broker: Broker): Promise<void> {
  if (!db.outboxPending || db.outboxSent) return;
  await broker.publish("E"); // Broker acceptance is outside the DB transaction.
}
// faultscope:end fs-c03.relay-publish

// faultscope:begin fs-c03.mark-publication-complete
export function markPublicationComplete(db: OrderDb): void {
  db.outboxSent = true; // A crash before this can lead to another publish.
}
// faultscope:end fs-c03.mark-publication-complete
