"""FS-C08: business-data survival does not imply revision-guard survival."""

from dataclasses import dataclass


@dataclass(frozen=True)
class RecoveryRecord:
    state: str
    revision: int


@dataclass
class RecoveryStore:
    record: RecoveryRecord


class WeakRecoveryProjection:
    def __init__(self, store: RecoveryStore) -> None:
        self.store = store
        self.guard = 0  # Each new process starts without revision evidence.

    # faultscope:begin fs-c08.memory-only-revision
    def apply(self, event: RecoveryRecord) -> bool:
        if event.revision <= self.guard:
            return False
        self.store.record = RecoveryRecord(event.state, self.store.record.revision)
        self.guard = event.revision  # Not durable.
        return True
    # faultscope:end fs-c08.memory-only-revision


# faultscope:begin fs-c08.persist-state-with-revision
def persist_state_with_revision(store: RecoveryStore, next_record: RecoveryRecord) -> None:
    store.record = next_record  # One atomic durable record in this model.
# faultscope:end fs-c08.persist-state-with-revision


class StrongRecoveryProjection:
    def __init__(self, store: RecoveryStore) -> None:
        self.store = store
        self.current = RecoveryRecord("", 0)
        self.ready = False

    # faultscope:begin fs-c08.recover-state-with-revision
    @classmethod
    def recover(cls, store: RecoveryStore) -> "StrongRecoveryProjection":
        projection = cls(store)
        projection.current = store.record  # Restore value and revision together.
        projection.ready = True  # Only after recovery may events be applied.
        return projection
    # faultscope:end fs-c08.recover-state-with-revision

    # faultscope:begin fs-c08.reject-stale-after-restart
    def apply(self, event: RecoveryRecord) -> bool:
        if not self.ready or event.revision <= self.current.revision:
            return False
        persist_state_with_revision(self.store, event)
        self.current = event
        return True
    # faultscope:end fs-c08.reject-stale-after-restart


# faultscope:begin fs-c08.rebuild-before-ready
def rebuild_before_ready(history: list[RecoveryRecord]) -> StrongRecoveryProjection:
    store = RecoveryStore(RecoveryRecord("", 0))
    for event in history:  # Complete authoritative history; no external effects here.
        if event.revision > store.record.revision:
            persist_state_with_revision(store, event)
    return StrongRecoveryProjection.recover(store)  # Ready only after replay.
# faultscope:end fs-c08.rebuild-before-ready
