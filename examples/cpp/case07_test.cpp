#include <atomic>
#include <cassert>
#include <thread>
#include "case07.cpp"

void case07_wait_until_blocked(Case07Handoff& handoff) {
    std::unique_lock<std::mutex> lock(handoff.mutex);
    handoff.changed.wait(lock, [&] { return handoff.waiting; });
}

int main() {
    Case07Handoff weak;
    std::atomic<bool> weak_finished{false};
    std::thread weak_thread([&] {
        case07_precheck_then_block(weak, 21);
        weak_finished = true;
    });
    case07_wait_until_blocked(weak);
    case07_cancel(weak);
    assert(!weak_finished); // No receiver, so the weak send is still blocked.
    case07_receiver_ready(weak); // Clean up the intentional block.
    weak_thread.join();
    assert(weak.accepted == 42);

    Case07Handoff strong;
    bool strong_result = true;
    std::thread strong_thread([&] { strong_result = case07_blocking_send_with_cancel(strong, 42); });
    case07_wait_until_blocked(strong);
    case07_cancel(strong);
    strong_thread.join();
    assert(!strong_result && strong.accepted == 0);
    assert(!case07_long_work_check_cancel(strong, 100000));

    Case07Handoff ready;
    case07_receiver_ready(ready);
    assert(case07_blocking_send_with_cancel(ready, 42));
    case07_cancel(ready); // Late cancel does not undo completed delivery.
    assert(ready.accepted == 42);

    Case07Downstream downstream;
    std::thread downstream_thread([&] { case07_downstream_without_cancellation(downstream); });
    {
        std::unique_lock<std::mutex> lock(downstream.mutex);
        downstream.changed.wait(lock, [&] { return downstream.entered; });
        assert(!downstream.released);
        downstream.released = true;
        downstream.changed.notify_all();
    }
    downstream_thread.join();
}
