#include <cassert>
#include "case08.cpp"

int main() {
    Case08Store weak_store;
    Case08WeakProjection before{weak_store};
    assert(case08_memory_only_revision(before, {"SHIPPED", 44}));
    assert(!case08_memory_only_revision(before, {"PROCESSING", 42}));
    assert(weak_store.record.state == "SHIPPED");
    Case08WeakProjection after{weak_store};
    assert(case08_memory_only_revision(after, {"PROCESSING", 42}));
    assert(weak_store.record.state == "PROCESSING");

    Case08Store strong_store;
    case08_persist_state_with_revision(strong_store, {"SHIPPED", 44});
    auto recovered = case08_recover_state_with_revision(strong_store);
    assert(recovered.ready);
    assert(!case08_reject_stale_after_restart(recovered, {"PROCESSING", 42}));
    assert(strong_store.record.state == "SHIPPED");
    assert(case08_reject_stale_after_restart(recovered, {"DELIVERED", 45}));
    assert(strong_store.record.revision == 45);

    Case08Store replay_store;
    auto replayed = case08_rebuild_before_ready(replay_store,
                                               {{"PROCESSING", 42}, {"SHIPPED", 44}});
    assert(!case08_reject_stale_after_restart(replayed, {"PROCESSING", 42}));
}
