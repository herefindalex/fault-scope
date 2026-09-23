typedef struct {
    int confirmed;
    int outbox_pending;
    int outbox_sent;
} Case03OrderDb;

typedef int (*Case03Publish)(void *context, const char *event);

// faultscope:begin fs-c03.split-dual-write
int case03_confirm_then_publish(Case03OrderDb *db, Case03Publish publish, void *context) {
    db->confirmed = 1; // Separate durable DB commit.
    return publish(context, "E"); // A crash before this leaves no obligation.
}
// faultscope:end fs-c03.split-dual-write

// faultscope:begin fs-c03.business-state-commit
void case03_commit_business_state_only(Case03OrderDb *db) {
    db->confirmed = 1; // No broker event or publication intent is committed here.
}
// faultscope:end fs-c03.business-state-commit

// faultscope:begin fs-c03.durable-publication-intent
int case03_confirm_with_outbox(Case03OrderDb *db, int rollback) {
    Case03OrderDb next = *db; // Synthetic one-DB transaction.
    next.confirmed = 1;
    next.outbox_pending = 1; // Event E publication obligation.
    if (rollback) return 0;
    *db = next; // Both facts become authoritative together.
    return 1;
}
// faultscope:end fs-c03.durable-publication-intent

// faultscope:begin fs-c03.relay-publish
int case03_relay_publish_pending(Case03OrderDb *db, Case03Publish publish, void *context) {
    if (!db->outbox_pending || db->outbox_sent) return 1;
    return publish(context, "E"); // Broker acceptance is outside DB transaction.
}
// faultscope:end fs-c03.relay-publish

// faultscope:begin fs-c03.mark-publication-complete
void case03_mark_publication_complete(Case03OrderDb *db) {
    db->outbox_sent = 1; // A crash before this can lead to another publish.
}
// faultscope:end fs-c03.mark-publication-complete
