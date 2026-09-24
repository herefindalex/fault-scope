import unittest

from case04 import (
    DeliveryAck, RewardStore, ack_before_effect, apply_event_once,
    handle_reward_delivery, split_reward_and_marker, weak_effect_then_ack,
)


class Case04Test(unittest.TestCase):
    def test_delivery_and_protected_effect(self):
        weak, weak_ack = RewardStore(), DeliveryAck()
        weak_effect_then_ack(weak, weak_ack, "E", "User42", 100, True)
        self.assertNotIn("E", weak_ack.accepted)
        weak_effect_then_ack(weak, weak_ack, "E", "User42", 100, False)
        self.assertEqual(weak.balance["User42"], 200)

        ack_first, first_ack = RewardStore(), DeliveryAck()
        ack_before_effect(ack_first, first_ack, "E", "User42", 100, True)
        self.assertIn("E", first_ack.accepted)
        self.assertEqual(ack_first.balance.get("User42", 0), 0)

        strong, strong_ack = RewardStore(), DeliveryAck()
        self.assertTrue(apply_event_once(strong, "E", "User42", 100))
        self.assertFalse(apply_event_once(strong, "E", "User42", 100))
        self.assertEqual(strong.balance["User42"], 100)
        handle_reward_delivery(strong, strong_ack, "E", "User42", 100)
        self.assertEqual(strong.balance["User42"], 100)
        self.assertIn("E", strong_ack.accepted)

        split, marker = RewardStore(), set()
        split_reward_and_marker(split, marker, "E", "User42", 100, True)
        split_reward_and_marker(split, marker, "E", "User42", 100, False)
        self.assertEqual(split.balance["User42"], 200)


if __name__ == "__main__":
    unittest.main()
