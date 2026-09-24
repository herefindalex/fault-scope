#include <assert.h>
#include <stdatomic.h>
#include "case07.c"

typedef struct { Case07Handoff *handoff; atomic_int finished; int result; } Case07Task;

static int case07_weak_thread(void *arg) {
    Case07Task *task = arg;
    case07_precheck_then_block(task->handoff, 21);
    atomic_store(&task->finished, 1);
    return 0;
}

static int case07_strong_thread(void *arg) {
    Case07Task *task = arg;
    task->result = case07_blocking_send_with_cancel(task->handoff, 42);
    atomic_store(&task->finished, 1);
    return 0;
}

static void case07_wait_until_blocked(Case07Handoff *handoff) {
    mtx_lock(&handoff->mutex);
    while (!handoff->waiting) cnd_wait(&handoff->changed, &handoff->mutex);
    mtx_unlock(&handoff->mutex);
}

static int case07_downstream_thread(void *arg) {
    case07_downstream_without_cancellation(arg);
    return 0;
}

int main(void) {
    Case07Handoff weak;
    assert(case07_init(&weak));
    Case07Task weak_task = {.handoff = &weak};
    thrd_t weak_thread;
    assert(thrd_create(&weak_thread, case07_weak_thread, &weak_task) == thrd_success);
    case07_wait_until_blocked(&weak);
    case07_cancel(&weak);
    assert(!atomic_load(&weak_task.finished)); /* Cancel did not release weak send. */
    case07_receiver_ready(&weak); /* Clean up the intentional blocked send. */
    assert(thrd_join(weak_thread, NULL) == thrd_success);
    assert(weak.accepted == 42);
    case07_destroy(&weak);

    Case07Handoff strong;
    assert(case07_init(&strong));
    Case07Task strong_task = {.handoff = &strong};
    thrd_t strong_thread;
    assert(thrd_create(&strong_thread, case07_strong_thread, &strong_task) == thrd_success);
    case07_wait_until_blocked(&strong);
    case07_cancel(&strong);
    assert(thrd_join(strong_thread, NULL) == thrd_success);
    assert(strong_task.finished && strong_task.result == 0 && strong.accepted == 0);
    assert(!case07_long_work_check_cancel(&strong, 100000));
    case07_destroy(&strong);

    Case07Handoff ready;
    assert(case07_init(&ready));
    case07_receiver_ready(&ready);
    assert(case07_blocking_send_with_cancel(&ready, 42));
    case07_cancel(&ready); /* Late cancel does not retract accepted result. */
    assert(ready.accepted == 42);
    case07_destroy(&ready);

    Case07Downstream downstream = {0};
    assert(mtx_init(&downstream.mutex, mtx_plain) == thrd_success);
    assert(cnd_init(&downstream.changed) == thrd_success);
    thrd_t downstream_thread;
    assert(thrd_create(&downstream_thread, case07_downstream_thread, &downstream) == thrd_success);
    mtx_lock(&downstream.mutex);
    while (!downstream.entered) cnd_wait(&downstream.changed, &downstream.mutex);
    assert(!downstream.released);
    downstream.released = 1;
    cnd_broadcast(&downstream.changed);
    mtx_unlock(&downstream.mutex);
    assert(thrd_join(downstream_thread, NULL) == thrd_success);
    cnd_destroy(&downstream.changed);
    mtx_destroy(&downstream.mutex);
    return 0;
}
