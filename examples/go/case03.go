package examplesgo

import "errors"

var ErrTransactionRolledBack = errors.New("transaction rolled back")

type OrderDB struct {
	Confirmed     bool
	OutboxPending bool
	OutboxSent    bool
}

type EventBroker interface{ Publish(event string) error }

// faultscope:begin fs-c03.split-dual-write
func ConfirmThenPublish(db *OrderDB, broker EventBroker) error {
	db.Confirmed = true        // Separate durable DB commit.
	return broker.Publish("E") // A crash before this call loses the obligation.
}

// faultscope:end fs-c03.split-dual-write

// faultscope:begin fs-c03.business-state-commit
func CommitBusinessStateOnly(db *OrderDB) {
	db.Confirmed = true // Broker state and publication intent are not committed here.
}

// faultscope:end fs-c03.business-state-commit

// faultscope:begin fs-c03.durable-publication-intent
func ConfirmWithOutbox(db *OrderDB, rollback bool) error {
	next := *db // Synthetic representation of one authoritative DB transaction.
	next.Confirmed = true
	next.OutboxPending = true // Event E publication obligation.
	if rollback {
		return ErrTransactionRolledBack
	}
	*db = next // Both facts become authoritative together.
	return nil
}

// faultscope:end fs-c03.durable-publication-intent

// faultscope:begin fs-c03.relay-publish
func RelayPublishPending(db *OrderDB, broker EventBroker) error {
	if !db.OutboxPending || db.OutboxSent {
		return nil
	}
	return broker.Publish("E") // Broker acceptance is outside the DB transaction.
}

// faultscope:end fs-c03.relay-publish

// faultscope:begin fs-c03.mark-publication-complete
func MarkPublicationComplete(db *OrderDB) {
	db.OutboxSent = true // Only after broker acceptance; a crash before this may repeat E.
}

// faultscope:end fs-c03.mark-publication-complete
