#include <condition_variable>
#include <mutex>

struct Case07Handoff {
    std::mutex mutex;
    std::condition_variable changed;
    bool cancelled = false;
    bool receiver_ready = false;
    bool waiting = false;
    int accepted = 0;
};

struct Case07Downstream {
    std::mutex mutex;
    std::condition_variable changed;
    bool entered = false;
    bool released = false;
};

bool case07_is_cancelled(Case07Handoff& handoff) {
    std::lock_guard<std::mutex> guard(handoff.mutex);
    return handoff.cancelled;
}

void case07_cancel(Case07Handoff& handoff) {
    std::lock_guard<std::mutex> guard(handoff.mutex);
    handoff.cancelled = true;
    handoff.changed.notify_all();
}

void case07_receiver_ready(Case07Handoff& handoff) {
    std::lock_guard<std::mutex> guard(handoff.mutex);
    handoff.receiver_ready = true;
    handoff.changed.notify_all();
}

// faultscope:begin fs-c07.blocking-send-without-cancel
void case07_blocking_send_without_cancel(Case07Handoff& handoff, int result) {
    std::unique_lock<std::mutex> lock(handoff.mutex);
    handoff.waiting = true;
    handoff.changed.notify_all();
    handoff.changed.wait(lock, [&] { return handoff.receiver_ready; });
    handoff.accepted = result; // Cancel does not change the wait predicate.
}
// faultscope:end fs-c07.blocking-send-without-cancel

// faultscope:begin fs-c07.precheck-then-block
void case07_precheck_then_block(Case07Handoff& handoff, int item) {
    if (case07_is_cancelled(handoff)) return;
    int result = item * 2; // Bounded local computation.
    case07_blocking_send_without_cancel(handoff, result);
}
// faultscope:end fs-c07.precheck-then-block

// faultscope:begin fs-c07.blocking-send-with-cancel
bool case07_blocking_send_with_cancel(Case07Handoff& handoff, int result) {
    std::unique_lock<std::mutex> lock(handoff.mutex);
    handoff.waiting = true;
    handoff.changed.notify_all();
    handoff.changed.wait(lock, [&] { return handoff.receiver_ready || handoff.cancelled; });
    if (handoff.cancelled) return false;
    handoff.accepted = result;
    return true;
}
// faultscope:end fs-c07.blocking-send-with-cancel

// faultscope:begin fs-c07.long-work-check-cancel
bool case07_long_work_check_cancel(Case07Handoff& handoff, int units) {
    for (int index = 0; index < units; index++) {
        if (index % 1024 == 0 && case07_is_cancelled(handoff)) return false;
        long long bounded_unit = static_cast<long long>(index) * index;
        (void)bounded_unit;
    }
    return true;
}
// faultscope:end fs-c07.long-work-check-cancel

// faultscope:begin fs-c07.downstream-without-cancellation
void case07_downstream_without_cancellation(Case07Downstream& downstream) {
    std::unique_lock<std::mutex> lock(downstream.mutex);
    downstream.entered = true;
    downstream.changed.notify_all();
    downstream.changed.wait(lock, [&] { return downstream.released; });
    // No cancellation input.
}
// faultscope:end fs-c07.downstream-without-cancellation
