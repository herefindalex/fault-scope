import assert from "node:assert/strict";
import { test } from "node:test";
import {
  commitBusinessStateOnly,
  confirmWithOutbox,
  markPublicationComplete,
  relayPublishPending,
  type OrderDb,
} from "./case03.ts";

function db(): OrderDb {
  return { confirmed: false, outboxPending: false, outboxSent: false };
}

test("outbox closes the DB commit gap but relay may publish twice", async () => {
  const weak = db();
  commitBusinessStateOnly(weak); // Process stops before publish is invoked.
  assert.equal(weak.confirmed, true);
  assert.equal(weak.outboxPending, false);
  const rolledBack = db();
  assert.throws(() => confirmWithOutbox(rolledBack, true));
  assert.equal(rolledBack.confirmed, false);
  assert.equal(rolledBack.outboxPending, false);

  const repaired = db();
  const events: string[] = [];
  const broker = { publish: async (event: string) => { events.push(event); } };
  confirmWithOutbox(repaired, false);
  assert.equal(repaired.confirmed && repaired.outboxPending, true);
  await relayPublishPending(repaired, broker);
  await relayPublishPending(repaired, broker); // Crash before marking SENT.
  assert.deepEqual(events, ["E", "E"]);
  markPublicationComplete(repaired);
  await relayPublishPending(repaired, broker);
  assert.equal(events.length, 2);
});
