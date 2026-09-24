#include <string.h>
#include <threads.h>

typedef struct {
    char state[24];
    int revision;
} Case08Record;

typedef struct {
    Case08Record record;
    mtx_t mutex;
} Case08Store;

static void case08_store_init(Case08Store *store) {
    store->record = (Case08Record){{0}, 0};
    mtx_init(&store->mutex, mtx_plain);
}

typedef struct {
    Case08Store *store;
    int guard; /* Lost with the process. */
} Case08WeakProjection;

// faultscope:begin fs-c08.memory-only-revision
int case08_memory_only_revision(Case08WeakProjection *projection, Case08Record event) {
    if (event.revision <= projection->guard) return 0;
    mtx_lock(&projection->store->mutex);
    memcpy(projection->store->record.state, event.state, sizeof(event.state)); /* Value only. */
    mtx_unlock(&projection->store->mutex);
    projection->guard = event.revision;
    return 1;
}
// faultscope:end fs-c08.memory-only-revision

// faultscope:begin fs-c08.persist-state-with-revision
void case08_persist_state_with_revision(Case08Store *store, Case08Record next) {
    mtx_lock(&store->mutex);
    store->record = next; /* One coherent durable record in this model. */
    mtx_unlock(&store->mutex);
}
// faultscope:end fs-c08.persist-state-with-revision

typedef struct {
    Case08Store *store;
    Case08Record current;
    int ready;
} Case08StrongProjection;

// faultscope:begin fs-c08.recover-state-with-revision
Case08StrongProjection case08_recover_state_with_revision(Case08Store *store) {
    Case08StrongProjection projection = {.store = store, .ready = 0};
    mtx_lock(&store->mutex);
    projection.current = store->record; /* Restore value and revision together. */
    mtx_unlock(&store->mutex);
    projection.ready = 1; /* Only after recovery may events be applied. */
    return projection;
}
// faultscope:end fs-c08.recover-state-with-revision

// faultscope:begin fs-c08.reject-stale-after-restart
int case08_reject_stale_after_restart(Case08StrongProjection *projection, Case08Record event) {
    if (!projection->ready || event.revision <= projection->current.revision) return 0;
    case08_persist_state_with_revision(projection->store, event);
    projection->current = event;
    return 1;
}
// faultscope:end fs-c08.reject-stale-after-restart

// faultscope:begin fs-c08.rebuild-before-ready
Case08StrongProjection case08_rebuild_before_ready(Case08Store *store,
                                                    const Case08Record *history, int count) {
    case08_persist_state_with_revision(store, (Case08Record){{0}, 0});
    for (int index = 0; index < count; index++) { /* Complete authoritative history. */
        if (history[index].revision > store->record.revision)
            case08_persist_state_with_revision(store, history[index]);
    }
    return case08_recover_state_with_revision(store); /* Ready only after replay. */
}
// faultscope:end fs-c08.rebuild-before-ready
