export type ProductSnapshot = { product: string; revision: number; price: number };
export type ProductProjection = { records: Map<string, ProductSnapshot> };
export type FreshRead = { status: "OK" | "NOT_FOUND" | "NOT_FRESH_ENOUGH"; snapshot?: ProductSnapshot };

export const newProductProjection = (): ProductProjection => ({ records: new Map() });
export function putProduct(p: ProductProjection, snapshot: ProductSnapshot): void {
  p.records.set(snapshot.product, { ...snapshot });
}

// faultscope:begin fs-c06.read-current-projection
export function readCurrentProjection(p: ProductProjection, product: string): FreshRead {
  const snapshot = p.records.get(product);
  return snapshot ? { status: "OK", snapshot: { ...snapshot } } : { status: "NOT_FOUND" };
}
// faultscope:end fs-c06.read-current-projection

// faultscope:begin fs-c06.sleep-before-read
export async function sleepBeforeRead(p: ProductProjection, product: string, delayMs: number): Promise<FreshRead> {
  await new Promise((resolve) => setTimeout(resolve, delayMs)); // Not a freshness proof.
  return readCurrentProjection(p, product);
}
// faultscope:end fs-c06.sleep-before-read

// faultscope:begin fs-c06.reject-insufficient-revision
export function rejectInsufficientRevision(snapshot: ProductSnapshot, minimum: number): boolean {
  return snapshot.revision < minimum;
}
// faultscope:end fs-c06.reject-insufficient-revision

// faultscope:begin fs-c06.serve-fresh-enough-projection
export function serveFreshEnoughProjection(snapshot: ProductSnapshot, minimum: number): FreshRead {
  if (rejectInsufficientRevision(snapshot, minimum)) return { status: "NOT_FRESH_ENOUGH" };
  return { status: "OK", snapshot }; // 44 or 45 satisfies 44.
}
// faultscope:end fs-c06.serve-fresh-enough-projection

// faultscope:begin fs-c06.read-at-least-revision
export function readAtLeastRevision(p: ProductProjection, product: string, minimum: number): FreshRead {
  const current = readCurrentProjection(p, product);
  if (current.status !== "OK") return current;
  return serveFreshEnoughProjection(current.snapshot!, minimum);
}
// faultscope:end fs-c06.read-at-least-revision
