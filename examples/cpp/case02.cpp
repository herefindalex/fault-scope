#include <string>

// Synthetic protected Job Store; each method models one atomic mutation.
struct Case02JobStore {
    int current_generation = 7;
    bool running = true;
    std::string result;

    void takeover(int generation) { current_generation = generation; }

    // faultscope:begin fs-c02.commit-without-generation
    bool store_result_weak(const std::string& value) {
        if (!running) return false;
        result = value; // A7 can commit after B8 takes over.
        return true;
    }
    // faultscope:end fs-c02.commit-without-generation

    // faultscope:begin fs-c02.commit-with-generation
    bool store_result_gated(int acquired_generation, const std::string& value) {
        // Check and write atomically at the protected Job Store.
        if (!running || acquired_generation != current_generation) return false;
        result = value;
        return true;
    }
    // faultscope:end fs-c02.commit-with-generation
};

// faultscope:begin fs-c02.local-authority-check
bool case02_local_check_then_weak_commit(bool lease_valid, Case02JobStore& store, const std::string& value) {
    if (!lease_valid) return false;
    // A takeover may occur after this local check.
    return store.store_result_weak(value);
}
// faultscope:end fs-c02.local-authority-check

// faultscope:begin fs-c02.current-generation-commit
bool case02_commit_current_worker(Case02JobStore& store, const std::string& value) {
    return store.store_result_gated(8, value); // B8 still makes progress.
}
// faultscope:end fs-c02.current-generation-commit
