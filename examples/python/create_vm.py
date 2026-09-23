from typing import Protocol

class NoCompletionResponse(Exception): pass
class Unresolved(Exception): pass
class Client(Protocol):
    def create_vm(self, operation_id: str | None, size: str) -> None: ...

# faultscope:begin fs-c01.retry-independent-attempt
def retry_independent(client: Client, size: str) -> None:
    try:
        client.create_vm(None, size)
    except NoCompletionResponse:
        client.create_vm(None, size)  # No repeat protection is documented.
# faultscope:end fs-c01.retry-independent-attempt

# faultscope:begin fs-c01.keep-unresolved
def keep_unresolved(error: Exception) -> None:
    if isinstance(error, NoCompletionResponse):
        raise Unresolved("Outcome unresolved") from error
    raise error
# faultscope:end fs-c01.keep-unresolved

# faultscope:begin fs-c01.retry-same-logical-operation
def retry_same_operation(client: Client, size: str, p: str) -> None:
    try:
        client.create_vm(p, size)
    except NoCompletionResponse:
        client.create_vm(p, size)  # Compatible repeat of P under the stronger contract.
# faultscope:end fs-c01.retry-same-logical-operation

# faultscope:begin fs-c01.retry-with-new-logical-operation
def retry_with_new_operation(client: Client, size: str, p: str, q: str) -> None:
    try:
        client.create_vm(p, size)
    except NoCompletionResponse:
        client.create_vm(q, size)  # Q is a different logical operation.
# faultscope:end fs-c01.retry-with-new-logical-operation
