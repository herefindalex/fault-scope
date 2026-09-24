<?php
declare(strict_types=1);

final class Case08Record
{
    public function __construct(public string $state, public int $revision) {}
}

final class Case08Store
{
    public function __construct(public Case08Record $record) {}
}

final class Case08WeakProjection
{
    private int $guard = 0; // Lost with the process.
    public function __construct(private Case08Store $store) {}

    // faultscope:begin fs-c08.memory-only-revision
    public function apply(Case08Record $event): bool
    {
        if ($event->revision <= $this->guard) return false;
        $this->store->record = new Case08Record($event->state, $this->store->record->revision);
        $this->guard = $event->revision; // Revision is not durable.
        return true;
    }
    // faultscope:end fs-c08.memory-only-revision
}

// faultscope:begin fs-c08.persist-state-with-revision
function case08PersistStateWithRevision(Case08Store $store, Case08Record $next): void
{
    $store->record = $next; // One atomic durable record in this model.
}
// faultscope:end fs-c08.persist-state-with-revision

final class Case08StrongProjection
{
    private bool $ready = false;
    private Case08Record $current;
    private function __construct(private Case08Store $store) {}

    // faultscope:begin fs-c08.recover-state-with-revision
    public static function recover(Case08Store $store): self
    {
        $projection = new self($store);
        $projection->current = $store->record; // Restore value and revision together.
        $projection->ready = true; // Only after recovery may events be applied.
        return $projection;
    }
    // faultscope:end fs-c08.recover-state-with-revision

    // faultscope:begin fs-c08.reject-stale-after-restart
    public function apply(Case08Record $event): bool
    {
        if (!$this->ready || $event->revision <= $this->current->revision) return false;
        case08PersistStateWithRevision($this->store, $event);
        $this->current = $event;
        return true;
    }
    // faultscope:end fs-c08.reject-stale-after-restart
}

// faultscope:begin fs-c08.rebuild-before-ready
function case08RebuildBeforeReady(array $history): Case08StrongProjection
{
    $store = new Case08Store(new Case08Record('', 0));
    foreach ($history as $event) { // Complete authoritative history; no external effects here.
        if ($event->revision > $store->record->revision) case08PersistStateWithRevision($store, $event);
    }
    return Case08StrongProjection::recover($store); // Ready only after replay.
}
// faultscope:end fs-c08.rebuild-before-ready
