import unittest

from case08 import (
    RecoveryRecord,
    RecoveryStore,
    WeakRecoveryProjection,
    StrongRecoveryProjection,
    persist_state_with_revision,
    rebuild_before_ready,
)


class Case08RecoveryTest(unittest.TestCase):
    def test_recovery_restores_revision_evidence(self) -> None:
        weak_store = RecoveryStore(RecoveryRecord("", 0))
        before = WeakRecoveryProjection(weak_store)
        self.assertTrue(before.apply(RecoveryRecord("SHIPPED", 44)))
        self.assertFalse(before.apply(RecoveryRecord("PROCESSING", 42)))
        self.assertEqual(weak_store.record.state, "SHIPPED")
        after = WeakRecoveryProjection(weak_store)
        self.assertTrue(after.apply(RecoveryRecord("PROCESSING", 42)))
        self.assertEqual(weak_store.record.state, "PROCESSING")

        strong_store = RecoveryStore(RecoveryRecord("", 0))
        persist_state_with_revision(strong_store, RecoveryRecord("SHIPPED", 44))
        recovered = StrongRecoveryProjection.recover(strong_store)
        self.assertTrue(recovered.ready)
        self.assertFalse(recovered.apply(RecoveryRecord("PROCESSING", 42)))
        self.assertEqual(strong_store.record, RecoveryRecord("SHIPPED", 44))
        self.assertTrue(recovered.apply(RecoveryRecord("DELIVERED", 45)))
        self.assertEqual(strong_store.record, RecoveryRecord("DELIVERED", 45))

        rebuilt = rebuild_before_ready([
            RecoveryRecord("PROCESSING", 42), RecoveryRecord("SHIPPED", 44)
        ])
        self.assertFalse(rebuilt.apply(RecoveryRecord("PROCESSING", 42)))


if __name__ == "__main__":
    unittest.main()
