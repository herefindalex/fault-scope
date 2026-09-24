#include <map>
#include <mutex>
#include <set>
#include <string>

struct Case05Change {
    std::string shipment;
    int revision;
    std::string state;
};

struct Case05Projection {
    std::mutex mutex;
    std::map<std::string, Case05Change> records;

    Case05Change read(const std::string& shipment) {
        std::lock_guard<std::mutex> guard(mutex);
        return records.at(shipment);
    }
};

// faultscope:begin fs-c05.apply-on-arrival
void case05_apply_on_arrival(Case05Projection& projection, const Case05Change& incoming) {
    std::lock_guard<std::mutex> guard(projection.mutex);
    projection.records.insert_or_assign(incoming.shipment, incoming); // E42 can overwrite E43.
}
// faultscope:end fs-c05.apply-on-arrival

// faultscope:begin fs-c05.reject-stale-revision
bool case05_reject_stale_revision(int applied, int incoming) {
    return incoming <= applied; // Equal revision is a duplicate.
}
// faultscope:end fs-c05.reject-stale-revision

// faultscope:begin fs-c05.accept-newer-revision
void case05_accept_newer_revision(Case05Projection& projection, const Case05Change& incoming) {
    projection.records.insert_or_assign(incoming.shipment, incoming); // State and revision together.
}
// faultscope:end fs-c05.accept-newer-revision

// faultscope:begin fs-c05.apply-if-newer
bool case05_apply_if_newer(Case05Projection& projection, const Case05Change& incoming) {
    std::lock_guard<std::mutex> guard(projection.mutex); // One atomic projection mutation.
    auto current = projection.records.find(incoming.shipment);
    if (current != projection.records.end() &&
        case05_reject_stale_revision(current->second.revision, incoming.revision)) return false;
    case05_accept_newer_revision(projection, incoming);
    return true;
}
// faultscope:end fs-c05.apply-if-newer

void case05_add_shipment_tag(std::set<std::string>& tags, const std::string& tag) {
    tags.insert(tag);
}
