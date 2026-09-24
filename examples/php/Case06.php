<?php
declare(strict_types=1);

final class Case06Snapshot
{
    public function __construct(
        public string $product,
        public int $revision,
        public int $price,
    ) {}
}

final class Case06Projection
{
    /** @var array<string, Case06Snapshot> */
    public array $records = [];
    public function put(Case06Snapshot $snapshot): void { $this->records[$snapshot->product] = $snapshot; }
}

final class Case06Read
{
    public function __construct(public string $status, public ?Case06Snapshot $snapshot = null) {}
}

// faultscope:begin fs-c06.read-current-projection
function case06ReadCurrentProjection(Case06Projection $projection, string $product): Case06Read
{
    $snapshot = $projection->records[$product] ?? null;
    return $snapshot === null ? new Case06Read('NOT_FOUND') : new Case06Read('OK', $snapshot);
}
// faultscope:end fs-c06.read-current-projection

// faultscope:begin fs-c06.sleep-before-read
function case06SleepBeforeRead(Case06Projection $projection, string $product, int $delayMillis): Case06Read
{
    usleep($delayMillis * 1000); // No propagation bound means no freshness proof.
    return case06ReadCurrentProjection($projection, $product);
}
// faultscope:end fs-c06.sleep-before-read

// faultscope:begin fs-c06.reject-insufficient-revision
function case06RejectInsufficientRevision(Case06Snapshot $snapshot, int $minimum): bool
{
    return $snapshot->revision < $minimum;
}
// faultscope:end fs-c06.reject-insufficient-revision

// faultscope:begin fs-c06.serve-fresh-enough-projection
function case06ServeFreshEnoughProjection(Case06Snapshot $snapshot, int $minimum): Case06Read
{
    if (case06RejectInsufficientRevision($snapshot, $minimum)) return new Case06Read('NOT_FRESH_ENOUGH');
    return new Case06Read('OK', $snapshot); // Revision 44 or 45 satisfies minimum 44.
}
// faultscope:end fs-c06.serve-fresh-enough-projection

// faultscope:begin fs-c06.read-at-least-revision
function case06ReadAtLeastRevision(Case06Projection $projection, string $product, int $minimum): Case06Read
{
    $current = case06ReadCurrentProjection($projection, $product);
    if ($current->status !== 'OK') return $current;
    return case06ServeFreshEnoughProjection($current->snapshot, $minimum);
}
// faultscope:end fs-c06.read-at-least-revision
