"""FS-C05: source-defined revision order for one shipment projection."""

from dataclasses import dataclass, field
from threading import Lock


@dataclass(frozen=True)
class ShipmentChange:
    shipment: str
    revision: int
    state: str


@dataclass
class ShipmentProjection:
    records: dict[str, ShipmentChange] = field(default_factory=dict)
    lock: Lock = field(default_factory=Lock)

    def read(self, shipment: str) -> ShipmentChange | None:
        with self.lock:
            return self.records.get(shipment)


# faultscope:begin fs-c05.apply-on-arrival
def apply_on_arrival(projection: ShipmentProjection, incoming: ShipmentChange) -> None:
    with projection.lock:
        projection.records[incoming.shipment] = incoming  # E42 can overwrite E43.
# faultscope:end fs-c05.apply-on-arrival


# faultscope:begin fs-c05.reject-stale-revision
def reject_stale_revision(applied: int, incoming: int) -> bool:
    return incoming <= applied  # Equal revision is a duplicate.
# faultscope:end fs-c05.reject-stale-revision


# faultscope:begin fs-c05.accept-newer-revision
def accept_newer_revision(projection: ShipmentProjection, incoming: ShipmentChange) -> None:
    projection.records[incoming.shipment] = incoming  # State and revision together.
# faultscope:end fs-c05.accept-newer-revision


# faultscope:begin fs-c05.apply-if-newer
def apply_if_newer(projection: ShipmentProjection, incoming: ShipmentChange) -> bool:
    with projection.lock:  # Models one atomic projection mutation.
        current = projection.records.get(incoming.shipment)
        if current and reject_stale_revision(current.revision, incoming.revision):
            return False
        accept_newer_revision(projection, incoming)
        return True
# faultscope:end fs-c05.apply-if-newer


def add_shipment_tag(tags: set[str], tag: str) -> None:
    tags.add(tag)
