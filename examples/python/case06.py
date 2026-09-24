"""FS-C06: a successful read is fresh only relative to its requested minimum."""

from dataclasses import dataclass, field
from threading import Lock
from time import sleep


@dataclass(frozen=True)
class ProductSnapshot:
    product: str
    revision: int
    price: int


@dataclass
class ProductProjection:
    records: dict[str, ProductSnapshot] = field(default_factory=dict)
    lock: Lock = field(default_factory=Lock)

    def put(self, snapshot: ProductSnapshot) -> None:
        with self.lock:
            self.records[snapshot.product] = snapshot


@dataclass(frozen=True)
class FreshRead:
    status: str
    snapshot: ProductSnapshot | None = None


# faultscope:begin fs-c06.read-current-projection
def read_current_projection(projection: ProductProjection, product: str) -> FreshRead:
    with projection.lock:
        snapshot = projection.records.get(product)
    return FreshRead("OK", snapshot) if snapshot else FreshRead("NOT_FOUND")
# faultscope:end fs-c06.read-current-projection


# faultscope:begin fs-c06.sleep-before-read
def sleep_before_read(projection: ProductProjection, product: str, delay: float) -> FreshRead:
    sleep(delay)  # Without a propagation bound, this proves nothing about freshness.
    return read_current_projection(projection, product)
# faultscope:end fs-c06.sleep-before-read


# faultscope:begin fs-c06.reject-insufficient-revision
def reject_insufficient_revision(snapshot: ProductSnapshot, minimum: int) -> bool:
    return snapshot.revision < minimum
# faultscope:end fs-c06.reject-insufficient-revision


# faultscope:begin fs-c06.serve-fresh-enough-projection
def serve_fresh_enough_projection(snapshot: ProductSnapshot, minimum: int) -> FreshRead:
    if reject_insufficient_revision(snapshot, minimum):
        return FreshRead("NOT_FRESH_ENOUGH")
    return FreshRead("OK", snapshot)  # Revision 44 or 45 satisfies minimum 44.
# faultscope:end fs-c06.serve-fresh-enough-projection


# faultscope:begin fs-c06.read-at-least-revision
def read_at_least_revision(projection: ProductProjection, product: str, minimum: int) -> FreshRead:
    current = read_current_projection(projection, product)
    if current.status != "OK":
        return current
    return serve_fresh_enough_projection(current.snapshot, minimum)
# faultscope:end fs-c06.read-at-least-revision
