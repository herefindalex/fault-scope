import assert from "node:assert/strict";
import { test } from "node:test";
import {
  newProductProjection,
  putProduct,
  readAtLeastRevision,
  readCurrentProjection,
  sleepBeforeRead,
} from "./case06.ts";

test("minimum revision is a lower bound, not transport success or exact value", async () => {
  const projection = newProductProjection();
  putProduct(projection, { product: "Product42", revision: 43, price: 100 });
  assert.equal(readCurrentProjection(projection, "Product42").snapshot?.revision, 43);
  assert.equal((await sleepBeforeRead(projection, "Product42", 0)).snapshot?.revision, 43);
  assert.equal(readAtLeastRevision(projection, "Product42", 44).status, "NOT_FRESH_ENOUGH");
  assert.equal(readAtLeastRevision(projection, "Product42", 0).snapshot?.revision, 43);
  putProduct(projection, { product: "Product42", revision: 44, price: 120 });
  assert.equal(readAtLeastRevision(projection, "Product42", 44).snapshot?.revision, 44);
  putProduct(projection, { product: "Product42", revision: 45, price: 125 });
  assert.equal(readAtLeastRevision(projection, "Product42", 44).snapshot?.price, 125);
  const cache = newProductProjection();
  putProduct(cache, { product: "Product42", revision: 43, price: 100 });
  assert.equal(readAtLeastRevision(cache, "Product42", 44).status, "NOT_FRESH_ENOUGH");
});
