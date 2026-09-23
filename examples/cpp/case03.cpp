#include <functional>
#include <stdexcept>
#include <string>

struct Case03OrderDb {
    bool confirmed = false;
    bool outbox_pending = false;
    bool outbox_sent = false;
};
using Case03Publish = std::function<void(const std::string&)>;

// faultscope:begin fs-c03.split-dual-write
void case03_confirm_then_publish(Case03OrderDb& db, const Case03Publish& publish) {
    db.confirmed = true; // Separate durable DB commit.
    publish("E"); // A crash before this leaves no durable obligation.
}
// faultscope:end fs-c03.split-dual-write

// faultscope:begin fs-c03.business-state-commit
void case03_commit_business_state_only(Case03OrderDb& db) {
    db.confirmed = true; // No publication intent is committed here.
}
// faultscope:end fs-c03.business-state-commit

// faultscope:begin fs-c03.durable-publication-intent
void case03_confirm_with_outbox(Case03OrderDb& db, bool rollback) {
    auto next = db; // Synthetic one-DB transaction.
    next.confirmed = true;
    next.outbox_pending = true; // Event E publication obligation.
    if (rollback) throw std::runtime_error("transaction rolled back");
    db = next; // Both facts become authoritative together.
}
// faultscope:end fs-c03.durable-publication-intent

// faultscope:begin fs-c03.relay-publish
void case03_relay_publish_pending(const Case03OrderDb& db, const Case03Publish& publish) {
    if (!db.outbox_pending || db.outbox_sent) return;
    publish("E"); // Broker acceptance is outside DB transaction.
}
// faultscope:end fs-c03.relay-publish

// faultscope:begin fs-c03.mark-publication-complete
void case03_mark_publication_complete(Case03OrderDb& db) {
    db.outbox_sent = true; // A crash before this can lead to another publish.
}
// faultscope:end fs-c03.mark-publication-complete
