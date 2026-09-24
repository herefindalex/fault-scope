<?php
declare(strict_types=1);

final class Case05Change
{
    public function __construct(
        public string $shipment,
        public int $revision,
        public string $state,
    ) {}
}

final class Case05Projection
{
    /** @var array<string, Case05Change> */
    public array $records = [];
}

// faultscope:begin fs-c05.apply-on-arrival
function case05ApplyOnArrival(Case05Projection $projection, Case05Change $incoming): void
{
    $projection->records[$incoming->shipment] = $incoming; // E42 can overwrite E43.
}
// faultscope:end fs-c05.apply-on-arrival

// faultscope:begin fs-c05.reject-stale-revision
function case05RejectStaleRevision(int $applied, int $incoming): bool
{
    return $incoming <= $applied; // Equal revision is a duplicate.
}
// faultscope:end fs-c05.reject-stale-revision

// faultscope:begin fs-c05.accept-newer-revision
function case05AcceptNewerRevision(Case05Projection $projection, Case05Change $incoming): void
{
    $projection->records[$incoming->shipment] = $incoming; // State and revision together.
}
// faultscope:end fs-c05.accept-newer-revision

// faultscope:begin fs-c05.apply-if-newer
function case05ApplyIfNewer(Case05Projection $projection, Case05Change $incoming): bool
{
    // This in-memory call is synchronous. A shared store needs an atomic conditional write.
    $current = $projection->records[$incoming->shipment] ?? null;
    if ($current !== null && case05RejectStaleRevision($current->revision, $incoming->revision)) {
        return false;
    }
    case05AcceptNewerRevision($projection, $incoming);
    return true;
}
// faultscope:end fs-c05.apply-if-newer

/** @param array<string, bool> $tags */
function case05AddShipmentTag(array &$tags, string $tag): void { $tags[$tag] = true; }
