import unittest

from create_vm import (
    NoCompletionResponse, retry_independent, retry_same_operation,
    retry_with_new_operation,
)


class Receiver:
    def __init__(self, protect: bool):
        self.protect = protect
        self.seen: set[str | None] = set()
        self.calls = 0
        self.vms = 0

    def create_vm(self, operation_id: str | None, size: str) -> None:
        self.calls += 1
        if not self.protect or operation_id not in self.seen:
            self.vms += 1
            self.seen.add(operation_id)
        if self.calls == 1:
            raise NoCompletionResponse()


class CreateVmTests(unittest.TestCase):
    def test_weak_repeat_can_create_two(self):
        receiver = Receiver(False)
        retry_independent(receiver, "small")
        self.assertEqual(receiver.vms, 2)

    def test_same_p_protects_one(self):
        receiver = Receiver(True)
        retry_same_operation(receiver, "small", "P")
        self.assertEqual(receiver.vms, 1)

    def test_p_then_q_can_create_two(self):
        receiver = Receiver(True)
        retry_with_new_operation(receiver, "small", "P", "Q")
        self.assertEqual(receiver.vms, 2)


if __name__ == "__main__":
    unittest.main()
