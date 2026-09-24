#include <mutex>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <utility>

struct Case04RewardState {
    std::unordered_map<std::string, int> balance;
    std::unordered_set<std::string> processed;
};

struct Case04RewardStore {
    std::mutex mutex;
    Case04RewardState state;

    void add(const std::string& user_id, int points) {
        state.balance[user_id] += points;
    }
};

struct Case04DeliveryAck { std::unordered_set<std::string> accepted; };

// faultscope:begin fs-c04.effect-then-ack
void case04_weak_effect_then_ack(Case04RewardStore& store, Case04DeliveryAck& ack,
                                 const std::string& event_id,
                                 const std::string& user_id, int points,
                                 bool crash_before_ack) {
    store.add(user_id, points); // Protected effect commits first.
    if (crash_before_ack) return; // Broker may redeliver E.
    ack.accepted.insert(event_id);
}
// faultscope:end fs-c04.effect-then-ack

// faultscope:begin fs-c04.ack-before-effect
void case04_ack_before_effect(Case04RewardStore& store, Case04DeliveryAck& ack,
                              const std::string& event_id,
                              const std::string& user_id, int points,
                              bool crash_after_ack) {
    ack.accepted.insert(event_id);
    if (crash_after_ack) return; // ACK survives; reward may be lost.
    store.add(user_id, points);
}
// faultscope:end fs-c04.ack-before-effect

// faultscope:begin fs-c04.apply-event-once
bool case04_apply_event_once(Case04RewardStore& store,
                             const std::string& event_id,
                             const std::string& user_id, int points) {
    std::lock_guard<std::mutex> lock(store.mutex);
    if (store.state.processed.count(event_id)) return false;
    // Model one Rewards Store transaction with a single commit point.
    auto next = store.state;
    next.processed.insert(event_id);
    next.balance[user_id] += points;
    store.state = std::move(next); // Identity and effect become visible together.
    return true;
}
// faultscope:end fs-c04.apply-event-once

// faultscope:begin fs-c04.redelivery-no-repeat
void case04_handle_reward_delivery(Case04RewardStore& store, Case04DeliveryAck& ack,
                                    const std::string& event_id,
                                    const std::string& user_id, int points) {
    case04_apply_event_once(store, event_id, user_id, points);
    ack.accepted.insert(event_id); // D2(E) can finish without another +100.
}
// faultscope:end fs-c04.redelivery-no-repeat

// faultscope:begin fs-c04.separate-dedupe-record
void case04_split_reward_and_marker(Case04RewardStore& store,
                                     std::unordered_set<std::string>& marker,
                                     const std::string& event_id,
                                     const std::string& user_id, int points,
                                     bool crash_before_marker) {
    if (marker.count(event_id)) return;
    store.add(user_id, points); // Separate reward durability boundary.
    if (crash_before_marker) return;
    marker.insert(event_id);
}
// faultscope:end fs-c04.separate-dedupe-record
