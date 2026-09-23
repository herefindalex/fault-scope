import unittest
from case02 import JobStore, commit_current_worker


class GenerationGateTest(unittest.TestCase):
    def test_stale_rejected_current_accepted(self):
        weak = JobStore()
        weak.takeover(8)  # B has not committed; still RUNNING.
        self.assertTrue(weak.store_result_weak("A7"))
        self.assertEqual(weak.result, "A7")
        gated = JobStore()
        gated.takeover(8)
        self.assertFalse(gated.store_result_gated(7, "A7"))
        self.assertIsNone(gated.result)
        self.assertTrue(commit_current_worker(gated, "B8"))
        self.assertEqual(gated.result, "B8")
