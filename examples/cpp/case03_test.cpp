#include <cassert>
#include <stdexcept>
#include <vector>
#include "case03.cpp"

int main() {
    Case03OrderDb weak;
    case03_commit_business_state_only(weak); // Process stops before publish is invoked.
    assert(weak.confirmed && !weak.outbox_pending);
    Case03OrderDb rolled_back;
    try {
        case03_confirm_with_outbox(rolled_back, true);
        assert(false);
    } catch (const std::runtime_error&) {
        assert(!rolled_back.confirmed && !rolled_back.outbox_pending);
    }
    Case03OrderDb repaired;
    case03_confirm_with_outbox(repaired, false);
    assert(repaired.confirmed && repaired.outbox_pending);
    std::vector<std::string> events;
    auto publish = [&](const std::string& event) { events.push_back(event); };
    case03_relay_publish_pending(repaired, publish);
    case03_relay_publish_pending(repaired, publish); // Crash before marking SENT.
    assert(events.size() == 2);
    case03_mark_publication_complete(repaired);
    case03_relay_publish_pending(repaired, publish);
    assert(events.size() == 2);
}
