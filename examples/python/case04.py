"""FS-C04: one logical event may have several deliveries but one protected effect."""

from dataclasses import dataclass, field
from threading import Lock


@dataclass
class RewardState:
    balance: dict[str, int] = field(default_factory=dict)
    processed: set[str] = field(default_factory=set)


@dataclass
class RewardStore:
    state: RewardState = field(default_factory=RewardState)
    lock: Lock = field(default_factory=Lock, repr=False)

    @property
    def balance(self) -> dict[str, int]:
        return self.state.balance

    def add(self, user_id: str, points: int) -> None:
        self.state.balance[user_id] = self.state.balance.get(user_id, 0) + points


@dataclass
class DeliveryAck:
    accepted: set[str] = field(default_factory=set)


# faultscope:begin fs-c04.effect-then-ack
def weak_effect_then_ack(
    store: RewardStore, ack: DeliveryAck, event_id: str,
    user_id: str, points: int, crash_before_ack: bool,
) -> None:
    store.add(user_id, points)  # Protected effect commits first.
    if crash_before_ack:
        return  # Broker may redeliver E.
    ack.accepted.add(event_id)
# faultscope:end fs-c04.effect-then-ack


# faultscope:begin fs-c04.ack-before-effect
def ack_before_effect(
    store: RewardStore, ack: DeliveryAck, event_id: str,
    user_id: str, points: int, crash_after_ack: bool,
) -> None:
    ack.accepted.add(event_id)
    if crash_after_ack:
        return  # ACK survives; reward may be lost.
    store.add(user_id, points)
# faultscope:end fs-c04.ack-before-effect


# faultscope:begin fs-c04.apply-event-once
def apply_event_once(store: RewardStore, event_id: str, user_id: str, points: int) -> bool:
    with store.lock:
        if event_id in store.state.processed:
            return False
        # Model a Rewards Store transaction with one commit point.
        next_state = RewardState(store.state.balance.copy(), store.state.processed.copy())
        next_state.processed.add(event_id)
        next_state.balance[user_id] = next_state.balance.get(user_id, 0) + points
        store.state = next_state  # Identity and effect become visible together.
        return True
# faultscope:end fs-c04.apply-event-once


# faultscope:begin fs-c04.redelivery-no-repeat
def handle_reward_delivery(
    store: RewardStore, ack: DeliveryAck, event_id: str, user_id: str, points: int,
) -> None:
    apply_event_once(store, event_id, user_id, points)
    ack.accepted.add(event_id)  # D2(E) can finish without another +100.
# faultscope:end fs-c04.redelivery-no-repeat


# faultscope:begin fs-c04.separate-dedupe-record
def split_reward_and_marker(
    store: RewardStore, marker: set[str], event_id: str,
    user_id: str, points: int, crash_before_marker: bool,
) -> None:
    if event_id in marker:
        return
    store.add(user_id, points)  # Separate reward durability boundary.
    if crash_before_marker:
        return
    marker.add(event_id)
# faultscope:end fs-c04.separate-dedupe-record
