// Synthetic protected Job Store; each function models one atomic mutation.
typedef struct {
    int current_generation;
    int running;
    const char *result;
} Case02JobStore;

void case02_takeover(Case02JobStore *store, int generation) {
    store->current_generation = generation;
    store->running = 1;
}

// faultscope:begin fs-c02.commit-without-generation
int case02_store_result_weak(Case02JobStore *store, const char *result) {
    if (!store->running) return 0;
    store->result = result; // A7 can commit after B8 takes over.
    return 1;
}
// faultscope:end fs-c02.commit-without-generation

// faultscope:begin fs-c02.commit-with-generation
int case02_store_result_gated(Case02JobStore *store, int acquired_generation, const char *result) {
    // Check and write atomically at the protected Job Store.
    if (!store->running || acquired_generation != store->current_generation) return 0;
    store->result = result;
    return 1;
}
// faultscope:end fs-c02.commit-with-generation

// faultscope:begin fs-c02.local-authority-check
int case02_local_check_then_weak_commit(int lease_valid, Case02JobStore *store, const char *result) {
    if (!lease_valid) return 0;
    // A takeover may occur after this local check.
    return case02_store_result_weak(store, result);
}
// faultscope:end fs-c02.local-authority-check

// faultscope:begin fs-c02.current-generation-commit
int case02_commit_current_worker(Case02JobStore *store, const char *result) {
    return case02_store_result_gated(store, 8, result); // B8 still makes progress.
}
// faultscope:end fs-c02.current-generation-commit
