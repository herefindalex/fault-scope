"""Synthetic database and broker durability boundaries."""

from dataclasses import dataclass, replace
from typing import Protocol


@dataclass
class OrderDb:
    confirmed: bool = False
    outbox_pending: bool = False
    outbox_sent: bool = False


class Broker(Protocol):
    def publish(self, event: str) -> None: ...


# faultscope:begin fs-c03.split-dual-write
def confirm_then_publish(db: OrderDb, broker: Broker) -> None:
    db.confirmed = True  # Separate durable DB commit.
    broker.publish("E")  # A crash before this leaves no durable obligation.
# faultscope:end fs-c03.split-dual-write


# faultscope:begin fs-c03.business-state-commit
def commit_business_state_only(db: OrderDb) -> None:
    db.confirmed = True  # No broker event or publication intent is committed here.
# faultscope:end fs-c03.business-state-commit


# faultscope:begin fs-c03.durable-publication-intent
def confirm_with_outbox(db: OrderDb, rollback: bool) -> None:
    next_state = replace(db)  # Synthetic single-DB transaction.
    next_state.confirmed = True
    next_state.outbox_pending = True  # Event E publication obligation.
    if rollback:
        raise RuntimeError("transaction rolled back")
    db.confirmed, db.outbox_pending = next_state.confirmed, next_state.outbox_pending
# faultscope:end fs-c03.durable-publication-intent


# faultscope:begin fs-c03.relay-publish
def relay_publish_pending(db: OrderDb, broker: Broker) -> None:
    if not db.outbox_pending or db.outbox_sent:
        return
    broker.publish("E")  # Broker acceptance is outside the DB transaction.
# faultscope:end fs-c03.relay-publish


# faultscope:begin fs-c03.mark-publication-complete
def mark_publication_complete(db: OrderDb) -> None:
    db.outbox_sent = True  # A crash before this can lead to another publish.
# faultscope:end fs-c03.mark-publication-complete
