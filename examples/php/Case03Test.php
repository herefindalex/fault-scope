<?php
declare(strict_types=1);
require_once __DIR__ . '/Case03.php';

$weak = new Case03OrderDb();
commitBusinessStateOnly($weak); // Process stops before publish is invoked.
if (!$weak->confirmed || $weak->outboxPending) throw new RuntimeException('weak gap missing');
$rolledBack = new Case03OrderDb();
try { confirmWithOutbox($rolledBack, true); throw new RuntimeException('expected rollback'); }
catch (RuntimeException $error) {
    if ($rolledBack->confirmed || $rolledBack->outboxPending) throw new RuntimeException('partial commit');
}
$repaired = new Case03OrderDb();
confirmWithOutbox($repaired, false);
if (!$repaired->confirmed || !$repaired->outboxPending) throw new RuntimeException('intent missing');
$broker = new class implements Case03Broker {
    public array $events = [];
    public function publish(string $event): void { $this->events[] = $event; }
};
relayPublishPending($repaired, $broker);
relayPublishPending($repaired, $broker); // Crash before marking SENT.
if ($broker->events !== ['E', 'E']) throw new RuntimeException('duplicate boundary missing');
markPublicationComplete($repaired);
relayPublishPending($repaired, $broker);
if (count($broker->events) !== 2) throw new RuntimeException('published after sent');
