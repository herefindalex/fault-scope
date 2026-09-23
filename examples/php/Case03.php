<?php
declare(strict_types=1);

final class Case03OrderDb {
    public bool $confirmed = false;
    public bool $outboxPending = false;
    public bool $outboxSent = false;
}

interface Case03Broker { public function publish(string $event): void; }

// faultscope:begin fs-c03.split-dual-write
function confirmThenPublish(Case03OrderDb $db, Case03Broker $broker): void {
    $db->confirmed = true; // Separate durable DB commit.
    $broker->publish('E'); // A crash before this leaves no durable obligation.
}
// faultscope:end fs-c03.split-dual-write

// faultscope:begin fs-c03.business-state-commit
function commitBusinessStateOnly(Case03OrderDb $db): void {
    $db->confirmed = true; // No publication intent is committed here.
}
// faultscope:end fs-c03.business-state-commit

// faultscope:begin fs-c03.durable-publication-intent
function confirmWithOutbox(Case03OrderDb $db, bool $rollback): void {
    // Synthetic one-DB transaction: publish both facts on commit only.
    $nextConfirmed = true;
    $nextOutboxPending = true;
    if ($rollback) throw new RuntimeException('transaction rolled back');
    $db->confirmed = $nextConfirmed;
    $db->outboxPending = $nextOutboxPending;
}
// faultscope:end fs-c03.durable-publication-intent

// faultscope:begin fs-c03.relay-publish
function relayPublishPending(Case03OrderDb $db, Case03Broker $broker): void {
    if (!$db->outboxPending || $db->outboxSent) return;
    $broker->publish('E'); // Broker acceptance is outside the DB transaction.
}
// faultscope:end fs-c03.relay-publish

// faultscope:begin fs-c03.mark-publication-complete
function markPublicationComplete(Case03OrderDb $db): void {
    $db->outboxSent = true; // A crash before this can lead to another publish.
}
// faultscope:end fs-c03.mark-publication-complete
