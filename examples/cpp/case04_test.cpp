#include <cassert>
#include "case04.cpp"

int main() {
    Case04RewardStore weak;
    Case04DeliveryAck weak_ack;
    case04_weak_effect_then_ack(weak, weak_ack, "E", "User42", 100, true);
    assert(!weak_ack.accepted.count("E"));
    case04_weak_effect_then_ack(weak, weak_ack, "E", "User42", 100, false);
    assert(weak.state.balance["User42"] == 200);

    Case04RewardStore ack_first;
    Case04DeliveryAck first_ack;
    case04_ack_before_effect(ack_first, first_ack, "E", "User42", 100, true);
    assert(first_ack.accepted.count("E") && ack_first.state.balance.empty());

    Case04RewardStore strong;
    assert(case04_apply_event_once(strong, "E", "User42", 100));
    assert(!case04_apply_event_once(strong, "E", "User42", 100));
    assert(strong.state.balance["User42"] == 100);
    Case04DeliveryAck strong_ack;
    case04_handle_reward_delivery(strong, strong_ack, "E", "User42", 100);
    assert(strong_ack.accepted.count("E") && strong.state.balance["User42"] == 100);

    Case04RewardStore split;
    std::unordered_set<std::string> marker;
    case04_split_reward_and_marker(split, marker, "E", "User42", 100, true);
    case04_split_reward_and_marker(split, marker, "E", "User42", 100, false);
    assert(split.state.balance["User42"] == 200);
}
