#include <mutex>
#include <string>
#include <vector>

struct Case08Record {
    std::string state;
    int revision;
};

struct Case08Store {
    Case08Record record{"", 0};
    std::mutex mutex;
};

struct Case08WeakProjection {
    Case08Store& store;
    int guard = 0; // Lost with the process.
};

// faultscope:begin fs-c08.memory-only-revision
bool case08_memory_only_revision(Case08WeakProjection& projection, const Case08Record& event) {
    if (event.revision <= projection.guard) return false;
    {
        std::lock_guard<std::mutex> lock(projection.store.mutex);
        projection.store.record.state = event.state; // Revision is not saved.
    }
    projection.guard = event.revision;
    return true;
}
// faultscope:end fs-c08.memory-only-revision

// faultscope:begin fs-c08.persist-state-with-revision
void case08_persist_state_with_revision(Case08Store& store, const Case08Record& next) {
    std::lock_guard<std::mutex> lock(store.mutex);
    store.record = next; // One coherent durable record in this model.
}
// faultscope:end fs-c08.persist-state-with-revision

struct Case08StrongProjection {
    Case08Store& store;
    Case08Record current{"", 0};
    bool ready = false;
};

// faultscope:begin fs-c08.recover-state-with-revision
Case08StrongProjection case08_recover_state_with_revision(Case08Store& store) {
    Case08StrongProjection projection{store};
    {
        std::lock_guard<std::mutex> lock(store.mutex);
        projection.current = store.record; // Restore value and revision together.
    }
    projection.ready = true; // Only after recovery may events be applied.
    return projection;
}
// faultscope:end fs-c08.recover-state-with-revision

// faultscope:begin fs-c08.reject-stale-after-restart
bool case08_reject_stale_after_restart(Case08StrongProjection& projection,
                                       const Case08Record& event) {
    if (!projection.ready || event.revision <= projection.current.revision) return false;
    case08_persist_state_with_revision(projection.store, event);
    projection.current = event;
    return true;
}
// faultscope:end fs-c08.reject-stale-after-restart

// faultscope:begin fs-c08.rebuild-before-ready
Case08StrongProjection case08_rebuild_before_ready(Case08Store& store,
                                                    const std::vector<Case08Record>& history) {
    case08_persist_state_with_revision(store, {"", 0});
    int revision = 0;
    for (const auto& event : history) { // Complete authoritative history; no external effects.
        if (event.revision > revision) {
            case08_persist_state_with_revision(store, event);
            revision = event.revision;
        }
    }
    return case08_recover_state_with_revision(store); // Ready only after replay.
}
// faultscope:end fs-c08.rebuild-before-ready
