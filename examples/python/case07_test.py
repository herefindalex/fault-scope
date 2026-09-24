import threading
import unittest

from case07 import (
    CancelSignal,
    ResultHandoff,
    blocking_send_with_cancel,
    downstream_without_cancellation,
    long_work_check_cancel,
    precheck_then_block,
)


class Case07Test(unittest.TestCase):
    def test_cancellation_at_handoff(self):
        weak_cancel, weak_handoff = CancelSignal(), ResultHandoff()
        weak = threading.Thread(target=precheck_then_block, args=(weak_cancel, weak_handoff, 21), daemon=True)
        weak.start()
        self.assertTrue(weak_handoff.waiting.wait(1))
        weak_cancel.cancel()
        self.assertTrue(weak.is_alive(), "weak send should remain blocked after cancel")
        weak_handoff.make_receiver_ready()  # Release the intentional weak block.
        weak.join(1)
        self.assertFalse(weak.is_alive())
        self.assertEqual(weak_handoff.accepted, 42)

        strong_cancel, strong_handoff = CancelSignal(), ResultHandoff()
        result = []
        strong = threading.Thread(target=lambda: result.append(blocking_send_with_cancel(strong_cancel, strong_handoff, 42)), daemon=True)
        strong.start()
        self.assertTrue(strong_handoff.waiting.wait(1))
        strong_cancel.cancel()
        strong.join(1)
        self.assertFalse(strong.is_alive())
        self.assertEqual(result, [False])

        ready_cancel, ready_handoff = CancelSignal(), ResultHandoff()
        ready_handoff.make_receiver_ready()
        self.assertTrue(blocking_send_with_cancel(ready_cancel, ready_handoff, 42))
        ready_cancel.cancel()  # Late cancel does not retract a delivered result.
        self.assertEqual(ready_handoff.accepted, 42)
        self.assertFalse(long_work_check_cancel(strong_cancel, 100000))

        release, entered = threading.Event(), threading.Event()
        downstream = threading.Thread(target=downstream_without_cancellation, args=(release, entered), daemon=True)
        downstream.start()
        self.assertTrue(entered.wait(1))
        self.assertTrue(downstream.is_alive())
        release.set()
        downstream.join(1)
        self.assertFalse(downstream.is_alive())


if __name__ == "__main__":
    unittest.main()
