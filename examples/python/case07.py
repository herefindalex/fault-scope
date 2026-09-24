"""FS-C07: the blocking handoff must participate in cancellation."""

from threading import Condition, Event, Lock
from typing import Callable


class CancelSignal:
    def __init__(self):
        self._lock = Lock()
        self._cancelled = False
        self._callbacks: list[Callable[[], None]] = []

    def cancelled(self) -> bool:
        with self._lock:
            return self._cancelled

    def cancel(self) -> None:
        with self._lock:
            self._cancelled = True
            callbacks = list(self._callbacks)
        for callback in callbacks:
            callback()

    def register(self, callback: Callable[[], None]) -> Callable[[], None]:
        with self._lock:
            already_cancelled = self._cancelled
            if not already_cancelled:
                self._callbacks.append(callback)
        if already_cancelled:
            callback()
        def unregister() -> None:
            with self._lock:
                if callback in self._callbacks:
                    self._callbacks.remove(callback)
        return unregister


class ResultHandoff:
    def __init__(self):
        self.condition = Condition()
        self.waiting = Event()
        self.receiver_ready = False
        self.accepted: int | None = None

    def make_receiver_ready(self) -> None:
        with self.condition:
            self.receiver_ready = True
            self.condition.notify_all()

    def wake(self) -> None:
        with self.condition:
            self.condition.notify_all()


# faultscope:begin fs-c07.blocking-send-without-cancel
def blocking_send_without_cancel(handoff: ResultHandoff, result: int) -> None:
    with handoff.condition:
        handoff.waiting.set()
        while not handoff.receiver_ready:
            handoff.condition.wait()  # Cancel is not part of this wait.
        handoff.accepted = result
# faultscope:end fs-c07.blocking-send-without-cancel


# faultscope:begin fs-c07.precheck-then-block
def precheck_then_block(cancel: CancelSignal, handoff: ResultHandoff, item: int) -> None:
    if cancel.cancelled():
        return
    result = item * 2  # Bounded local computation.
    blocking_send_without_cancel(handoff, result)
# faultscope:end fs-c07.precheck-then-block


# faultscope:begin fs-c07.blocking-send-with-cancel
def blocking_send_with_cancel(cancel: CancelSignal, handoff: ResultHandoff, result: int) -> bool:
    unregister = cancel.register(handoff.wake)
    try:
        with handoff.condition:
            handoff.waiting.set()
            while not handoff.receiver_ready and not cancel.cancelled():
                handoff.condition.wait()  # Cancel wakes this same condition.
            if cancel.cancelled():
                return False
            handoff.accepted = result
            return True
    finally:
        unregister()
# faultscope:end fs-c07.blocking-send-with-cancel


# faultscope:begin fs-c07.long-work-check-cancel
def long_work_check_cancel(cancel: CancelSignal, units: int) -> bool:
    for index in range(units):
        if index % 1024 == 0 and cancel.cancelled():
            return False
        _ = index * index
    return True
# faultscope:end fs-c07.long-work-check-cancel


# faultscope:begin fs-c07.downstream-without-cancellation
def downstream_without_cancellation(release: Event, entered: Event) -> None:
    entered.set()
    release.wait()  # This API never receives the cancel signal.
# faultscope:end fs-c07.downstream-without-cancellation
