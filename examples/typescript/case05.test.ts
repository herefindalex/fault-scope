import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addShipmentTag,
  applyIfNewer,
  applyOnArrival,
  newShipmentProjection,
  readShipment,
} from "./case05.ts";

test("source revision, not delivery order, guards one shipment projection", () => {
  const e42 = { shipment: "Shipment42", revision: 42, state: "PROCESSING" };
  const e43 = { shipment: "Shipment42", revision: 43, state: "SHIPPED" };
  const e44 = { shipment: "Shipment42", revision: 44, state: "DELIVERED" };
  const weak = newShipmentProjection();
  applyOnArrival(weak, e43);
  applyOnArrival(weak, e42);
  assert.deepEqual(readShipment(weak, "Shipment42"), e42);

  const strong = newShipmentProjection();
  assert.equal(applyIfNewer(strong, e43), true);
  assert.equal(applyIfNewer(strong, e42), false);
  assert.deepEqual(readShipment(strong, "Shipment42"), e43);
  assert.equal(applyIfNewer(strong, e43), false);
  assert.equal(applyIfNewer(strong, e44), true);
  assert.deepEqual(readShipment(strong, "Shipment42"), e44);
  assert.equal(applyIfNewer(strong, { shipment: "Shipment99", revision: 100, state: "CREATED" }), true);
  assert.deepEqual(readShipment(strong, "Shipment42"), e44);

  const tags = new Set<string>();
  addShipmentTag(tags, "fragile");
  addShipmentTag(tags, "priority");
  addShipmentTag(tags, "fragile");
  assert.equal(tags.size, 2);
});
