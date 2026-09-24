#include <threads.h>

typedef struct {
    mtx_t mutex;
    cnd_t changed;
    int cancelled;
    int receiver_ready;
    int waiting;
    int accepted;
} Case07Handoff;

typedef struct { mtx_t mutex; cnd_t changed; int entered; int released; } Case07Downstream;

static int case07_init(Case07Handoff *handoff) {
    if (mtx_init(&handoff->mutex, mtx_plain) != thrd_success) return 0;
    if (cnd_init(&handoff->changed) != thrd_success) { mtx_destroy(&handoff->mutex); return 0; }
    handoff->cancelled = handoff->receiver_ready = handoff->waiting = handoff->accepted = 0;
    return 1;
}

static void case07_destroy(Case07Handoff *handoff) {
    cnd_destroy(&handoff->changed);
    mtx_destroy(&handoff->mutex);
}

static int case07_is_cancelled(Case07Handoff *handoff) {
    mtx_lock(&handoff->mutex);
    int cancelled = handoff->cancelled;
    mtx_unlock(&handoff->mutex);
    return cancelled;
}

static void case07_cancel(Case07Handoff *handoff) {
    mtx_lock(&handoff->mutex);
    handoff->cancelled = 1;
    cnd_broadcast(&handoff->changed);
    mtx_unlock(&handoff->mutex);
}

static void case07_receiver_ready(Case07Handoff *handoff) {
    mtx_lock(&handoff->mutex);
    handoff->receiver_ready = 1;
    cnd_broadcast(&handoff->changed);
    mtx_unlock(&handoff->mutex);
}

// faultscope:begin fs-c07.blocking-send-without-cancel
void case07_blocking_send_without_cancel(Case07Handoff *handoff, int result) {
    mtx_lock(&handoff->mutex);
    handoff->waiting = 1;
    cnd_broadcast(&handoff->changed);
    while (!handoff->receiver_ready) cnd_wait(&handoff->changed, &handoff->mutex);
    handoff->accepted = result; /* Cancel does not change this wait predicate. */
    mtx_unlock(&handoff->mutex);
}
// faultscope:end fs-c07.blocking-send-without-cancel

// faultscope:begin fs-c07.precheck-then-block
void case07_precheck_then_block(Case07Handoff *handoff, int item) {
    if (case07_is_cancelled(handoff)) return;
    int result = item * 2; /* Bounded local computation. */
    case07_blocking_send_without_cancel(handoff, result);
}
// faultscope:end fs-c07.precheck-then-block

// faultscope:begin fs-c07.blocking-send-with-cancel
int case07_blocking_send_with_cancel(Case07Handoff *handoff, int result) {
    mtx_lock(&handoff->mutex);
    handoff->waiting = 1;
    cnd_broadcast(&handoff->changed);
    while (!handoff->receiver_ready && !handoff->cancelled)
        cnd_wait(&handoff->changed, &handoff->mutex);
    if (handoff->cancelled) { mtx_unlock(&handoff->mutex); return 0; }
    handoff->accepted = result;
    mtx_unlock(&handoff->mutex);
    return 1;
}
// faultscope:end fs-c07.blocking-send-with-cancel

// faultscope:begin fs-c07.long-work-check-cancel
int case07_long_work_check_cancel(Case07Handoff *handoff, int units) {
    for (int index = 0; index < units; index++) {
        if (index % 1024 == 0 && case07_is_cancelled(handoff)) return 0;
        long long bounded_unit = (long long)index * index;
        (void)bounded_unit;
    }
    return 1;
}
// faultscope:end fs-c07.long-work-check-cancel

// faultscope:begin fs-c07.downstream-without-cancellation
void case07_downstream_without_cancellation(Case07Downstream *downstream) {
    mtx_lock(&downstream->mutex);
    downstream->entered = 1;
    cnd_broadcast(&downstream->changed);
    while (!downstream->released) cnd_wait(&downstream->changed, &downstream->mutex);
    mtx_unlock(&downstream->mutex); /* No cancellation input. */
}
// faultscope:end fs-c07.downstream-without-cancellation
