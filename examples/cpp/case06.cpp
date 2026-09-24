#include <chrono>
#include <map>
#include <mutex>
#include <optional>
#include <string>
#include <thread>

struct Case06Snapshot {
    std::string product;
    int revision;
    int price;
};

struct Case06Projection {
    std::mutex mutex;
    std::map<std::string, Case06Snapshot> records;

    void put(const Case06Snapshot& snapshot) {
        std::lock_guard<std::mutex> guard(mutex);
        records.insert_or_assign(snapshot.product, snapshot);
    }
};

struct Case06Read {
    std::string status;
    std::optional<Case06Snapshot> snapshot;
};

// faultscope:begin fs-c06.read-current-projection
Case06Read case06_read_current_projection(Case06Projection& projection, const std::string& product) {
    std::lock_guard<std::mutex> guard(projection.mutex);
    auto found = projection.records.find(product);
    return found == projection.records.end()
        ? Case06Read{"NOT_FOUND", std::nullopt}
        : Case06Read{"OK", found->second}; // May be revision 43.
}
// faultscope:end fs-c06.read-current-projection

// faultscope:begin fs-c06.sleep-before-read
Case06Read case06_sleep_before_read(Case06Projection& projection, const std::string& product,
                                    std::chrono::milliseconds delay) {
    std::this_thread::sleep_for(delay); // No propagation bound means no freshness proof.
    return case06_read_current_projection(projection, product);
}
// faultscope:end fs-c06.sleep-before-read

// faultscope:begin fs-c06.reject-insufficient-revision
bool case06_reject_insufficient_revision(const Case06Snapshot& snapshot, int minimum) {
    return snapshot.revision < minimum;
}
// faultscope:end fs-c06.reject-insufficient-revision

// faultscope:begin fs-c06.serve-fresh-enough-projection
Case06Read case06_serve_fresh_enough_projection(const Case06Snapshot& snapshot, int minimum) {
    if (case06_reject_insufficient_revision(snapshot, minimum))
        return {"NOT_FRESH_ENOUGH", std::nullopt};
    return {"OK", snapshot}; // Revision 44 or 45 satisfies minimum 44.
}
// faultscope:end fs-c06.serve-fresh-enough-projection

// faultscope:begin fs-c06.read-at-least-revision
Case06Read case06_read_at_least_revision(Case06Projection& projection,
                                       const std::string& product, int minimum) {
    auto current = case06_read_current_projection(projection, product);
    if (current.status != "OK") return current;
    return case06_serve_fresh_enough_projection(*current.snapshot, minimum);
}
// faultscope:end fs-c06.read-at-least-revision
