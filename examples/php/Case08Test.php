<?php
declare(strict_types=1);
require_once __DIR__ . '/Case08.php';

function case08Assert(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

$weakStore = new Case08Store(new Case08Record('', 0));
$before = new Case08WeakProjection($weakStore);
case08Assert($before->apply(new Case08Record('SHIPPED', 44)), 'rev44 should apply');
case08Assert(!$before->apply(new Case08Record('PROCESSING', 42)), 'live guard rejects 42');
$after = new Case08WeakProjection($weakStore);
case08Assert($after->apply(new Case08Record('PROCESSING', 42)), 'new process loses guard');
case08Assert($weakStore->record->state === 'PROCESSING', 'value regresses');

$strongStore = new Case08Store(new Case08Record('', 0));
case08PersistStateWithRevision($strongStore, new Case08Record('SHIPPED', 44));
$recovered = Case08StrongProjection::recover($strongStore);
case08Assert(!$recovered->apply(new Case08Record('PROCESSING', 42)), 'recovered guard rejects 42');
case08Assert($strongStore->record->state === 'SHIPPED', 'value stays SHIPPED');
case08Assert($recovered->apply(new Case08Record('DELIVERED', 45)), 'rev45 accepted');
case08Assert($strongStore->record->revision === 45, 'value and revision advance');

$rebuilt = case08RebuildBeforeReady([
    new Case08Record('PROCESSING', 42), new Case08Record('SHIPPED', 44),
]);
case08Assert(!$rebuilt->apply(new Case08Record('PROCESSING', 42)), 'replay rebuilds guard');
