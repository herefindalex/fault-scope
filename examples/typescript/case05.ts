export type ShipmentChange = {
  shipment: string;
  revision: number;
  state: string;
};

export type ShipmentProjection = { records: Map<string, ShipmentChange> };
export const newShipmentProjection = (): ShipmentProjection => ({ records: new Map() });
export const readShipment = (p: ShipmentProjection, id: string) => p.records.get(id);

// faultscope:begin fs-c05.apply-on-arrival
export function applyOnArrival(p: ShipmentProjection, incoming: ShipmentChange): void {
  p.records.set(incoming.shipment, incoming); // E42 can overwrite E43.
}
// faultscope:end fs-c05.apply-on-arrival

// faultscope:begin fs-c05.reject-stale-revision
export function rejectStaleRevision(applied: number, incoming: number): boolean {
  return incoming <= applied; // Equal revision is a duplicate.
}
// faultscope:end fs-c05.reject-stale-revision

// faultscope:begin fs-c05.accept-newer-revision
export function acceptNewerRevision(p: ShipmentProjection, incoming: ShipmentChange): void {
  p.records.set(incoming.shipment, { ...incoming }); // State and revision together.
}
// faultscope:end fs-c05.accept-newer-revision

// faultscope:begin fs-c05.apply-if-newer
export function applyIfNewer(p: ShipmentProjection, incoming: ShipmentChange): boolean {
  // One synchronous projection mutation; a real store needs an atomic conditional write.
  const current = p.records.get(incoming.shipment);
  if (current && rejectStaleRevision(current.revision, incoming.revision)) return false;
  acceptNewerRevision(p, incoming);
  return true;
}
// faultscope:end fs-c05.apply-if-newer

export function addShipmentTag(tags: Set<string>, tag: string): void { tags.add(tag); }
