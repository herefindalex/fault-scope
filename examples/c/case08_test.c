#include <assert.h>
#include <string.h>
#include "case08.c"

int main(void) {
    Case08Store weak_store;
    case08_store_init(&weak_store);
    Case08WeakProjection before = {.store = &weak_store, .guard = 0};
    assert(case08_memory_only_revision(&before, (Case08Record){"SHIPPED", 44}));
    assert(!case08_memory_only_revision(&before, (Case08Record){"PROCESSING", 42}));
    assert(strcmp(weak_store.record.state, "SHIPPED") == 0);
    Case08WeakProjection after = {.store = &weak_store, .guard = 0};
    assert(case08_memory_only_revision(&after, (Case08Record){"PROCESSING", 42}));
    assert(strcmp(weak_store.record.state, "PROCESSING") == 0);
    mtx_destroy(&weak_store.mutex);

    Case08Store strong_store;
    case08_store_init(&strong_store);
    case08_persist_state_with_revision(&strong_store, (Case08Record){"SHIPPED", 44});
    Case08StrongProjection recovered = case08_recover_state_with_revision(&strong_store);
    assert(recovered.ready);
    assert(!case08_reject_stale_after_restart(&recovered, (Case08Record){"PROCESSING", 42}));
    assert(strcmp(strong_store.record.state, "SHIPPED") == 0);
    assert(case08_reject_stale_after_restart(&recovered, (Case08Record){"DELIVERED", 45}));
    assert(strong_store.record.revision == 45);
    mtx_destroy(&strong_store.mutex);

    Case08Store replay_store;
    case08_store_init(&replay_store);
    Case08Record history[] = {{"PROCESSING", 42}, {"SHIPPED", 44}};
    Case08StrongProjection replayed = case08_rebuild_before_ready(&replay_store, history, 2);
    assert(!case08_reject_stale_after_restart(&replayed, (Case08Record){"PROCESSING", 42}));
    mtx_destroy(&replay_store.mutex);
    return 0;
}
