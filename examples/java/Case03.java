final class Case03 {
    static final class OrderDb {
        boolean confirmed;
        boolean outboxPending;
        boolean outboxSent;
    }
    interface Broker { void publish(String event); }

    // faultscope:begin fs-c03.split-dual-write
    static void confirmThenPublish(OrderDb db, Broker broker) {
        db.confirmed = true; // Separate durable DB commit.
        broker.publish("E"); // A crash before this leaves no durable obligation.
    }
    // faultscope:end fs-c03.split-dual-write

    // faultscope:begin fs-c03.business-state-commit
    static void commitBusinessStateOnly(OrderDb db) {
        db.confirmed = true; // No broker event or publication intent is committed here.
    }
    // faultscope:end fs-c03.business-state-commit

    // faultscope:begin fs-c03.durable-publication-intent
    static void confirmWithOutbox(OrderDb db, boolean rollback) {
        // Synthetic one-DB transaction: publish both facts on commit only.
        boolean nextConfirmed = true;
        boolean nextOutboxPending = true;
        if (rollback) throw new IllegalStateException("transaction rolled back");
        db.confirmed = nextConfirmed;
        db.outboxPending = nextOutboxPending;
    }
    // faultscope:end fs-c03.durable-publication-intent

    // faultscope:begin fs-c03.relay-publish
    static void relayPublishPending(OrderDb db, Broker broker) {
        if (!db.outboxPending || db.outboxSent) return;
        broker.publish("E"); // Broker acceptance is outside the DB transaction.
    }
    // faultscope:end fs-c03.relay-publish

    // faultscope:begin fs-c03.mark-publication-complete
    static void markPublicationComplete(OrderDb db) {
        db.outboxSent = true; // A crash before this can lead to another publish.
    }
    // faultscope:end fs-c03.mark-publication-complete
}
