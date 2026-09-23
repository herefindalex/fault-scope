package examplesgo

import (
	"errors"
	"testing"
)

type recordingBroker struct {
	events []string
	fail   bool
}

func (b *recordingBroker) Publish(event string) error {
	if b.fail {
		return errors.New("broker unavailable")
	}
	b.events = append(b.events, event)
	return nil
}

func TestOutboxClosesCommitGapButAllowsDuplicatePublish(t *testing.T) {
	weak := &OrderDB{}
	CommitBusinessStateOnly(weak) // Process stops before Publish is invoked.
	if !weak.Confirmed || weak.OutboxPending {
		t.Fatal("weak dual write did not expose the pre-publish crash gap")
	}
	rolledBack := &OrderDB{}
	if ConfirmWithOutbox(rolledBack, true) == nil || rolledBack.Confirmed || rolledBack.OutboxPending {
		t.Fatal("rolled-back transaction left a partial fact")
	}
	repaired, broker := &OrderDB{}, &recordingBroker{}
	if err := ConfirmWithOutbox(repaired, false); err != nil {
		t.Fatal(err)
	}
	if !repaired.Confirmed || !repaired.OutboxPending {
		t.Fatal("commit lost publication obligation")
	}
	if err := RelayPublishPending(repaired, broker); err != nil {
		t.Fatal(err)
	}
	// Relay crashes before MarkPublicationComplete; pending work is retried.
	if err := RelayPublishPending(repaired, broker); err != nil {
		t.Fatal(err)
	}
	if len(broker.events) != 2 {
		t.Fatal("relay crash did not expose duplicate publication")
	}
	MarkPublicationComplete(repaired)
	if err := RelayPublishPending(repaired, broker); err != nil {
		t.Fatal(err)
	}
	if len(broker.events) != 2 {
		t.Fatal("sent record was published again")
	}
}
