import unittest
from case03 import OrderDb, commit_business_state_only, confirm_with_outbox, relay_publish_pending, mark_publication_complete


class Broker:
    def __init__(self, fail=False):
        self.events = []
        self.fail = fail

    def publish(self, event):
        if self.fail:
            raise RuntimeError("crash")
        self.events.append(event)


class OutboxTest(unittest.TestCase):
    def test_gap_rollback_and_duplicate(self):
        weak = OrderDb()
        commit_business_state_only(weak)  # Process stops before publish is invoked.
        self.assertTrue(weak.confirmed)
        self.assertFalse(weak.outbox_pending)
        rolled_back = OrderDb()
        with self.assertRaises(RuntimeError):
            confirm_with_outbox(rolled_back, rollback=True)
        self.assertFalse(rolled_back.confirmed)
        self.assertFalse(rolled_back.outbox_pending)
        repaired, broker = OrderDb(), Broker()
        confirm_with_outbox(repaired, rollback=False)
        self.assertTrue(repaired.confirmed and repaired.outbox_pending)
        relay_publish_pending(repaired, broker)
        relay_publish_pending(repaired, broker)  # Crash before marking SENT.
        self.assertEqual(broker.events, ["E", "E"])
        mark_publication_complete(repaired)
        relay_publish_pending(repaired, broker)
        self.assertEqual(len(broker.events), 2)
