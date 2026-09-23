"""Synthetic atomic Job Store for the stale-authority lesson."""


class JobStore:
    def __init__(self) -> None:
        self.current_generation = 7
        self.state = "RUNNING"
        self.result: str | None = None

    def takeover(self, generation: int) -> None:
        self.current_generation = generation

    # faultscope:begin fs-c02.commit-without-generation
    def store_result_weak(self, result: str) -> bool:
        if self.state != "RUNNING":
            return False
        self.result = result  # A7 can commit after B8 takes over.
        return True
    # faultscope:end fs-c02.commit-without-generation

    # faultscope:begin fs-c02.commit-with-generation
    def store_result_gated(self, acquired_generation: int, result: str) -> bool:
        # Check and write atomically at the protected resource.
        if self.state != "RUNNING" or acquired_generation != self.current_generation:
            return False
        self.result = result
        return True
    # faultscope:end fs-c02.commit-with-generation


# faultscope:begin fs-c02.local-authority-check
def local_check_then_weak_commit(lease_valid: bool, store: JobStore, result: str) -> bool:
    if not lease_valid:
        return False
    # A takeover can occur after this local check.
    return store.store_result_weak(result)
# faultscope:end fs-c02.local-authority-check


# faultscope:begin fs-c02.current-generation-commit
def commit_current_worker(store: JobStore, result: str) -> bool:
    return store.store_result_gated(8, result)  # B8 still makes progress.
# faultscope:end fs-c02.current-generation-commit
