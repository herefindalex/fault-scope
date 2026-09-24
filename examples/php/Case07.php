<?php
declare(strict_types=1);

// A cooperative event-loop model: each yield represents a pending handoff wait.
final class Case07CancelSignal { public bool $cancelled = false; public function cancel(): void { $this->cancelled = true; } }
final class Case07Handoff { public bool $receiverReady = false; public bool $waiting = false; public ?int $accepted = null; }
final class Case07Downstream { public bool $released = false; public bool $entered = false; }

// faultscope:begin fs-c07.blocking-send-without-cancel
function case07BlockingSendWithoutCancel(Case07Handoff $handoff, int $result): Generator
{
    $handoff->waiting = true;
    while (!$handoff->receiverReady) yield 'blocked'; // Cancel is not observed here.
    $handoff->accepted = $result;
}
// faultscope:end fs-c07.blocking-send-without-cancel

// faultscope:begin fs-c07.precheck-then-block
function case07PrecheckThenBlock(Case07CancelSignal $cancel, Case07Handoff $handoff, int $item): Generator
{
    if ($cancel->cancelled) return;
    $result = $item * 2; // Bounded local computation.
    yield from case07BlockingSendWithoutCancel($handoff, $result);
}
// faultscope:end fs-c07.precheck-then-block

// faultscope:begin fs-c07.blocking-send-with-cancel
function case07BlockingSendWithCancel(Case07CancelSignal $cancel, Case07Handoff $handoff,
                                       int $result): Generator
{
    $handoff->waiting = true;
    while (!$handoff->receiverReady && !$cancel->cancelled) yield 'blocked';
    if ($cancel->cancelled) return false;
    $handoff->accepted = $result;
    return true;
}
// faultscope:end fs-c07.blocking-send-with-cancel

// faultscope:begin fs-c07.long-work-check-cancel
function case07LongWorkCheckCancel(Case07CancelSignal $cancel, int $units): bool
{
    for ($index = 0; $index < $units; $index++) {
        if ($index % 1024 === 0 && $cancel->cancelled) return false;
        $boundedUnit = $index * $index;
    }
    return true;
}
// faultscope:end fs-c07.long-work-check-cancel

// faultscope:begin fs-c07.downstream-without-cancellation
function case07DownstreamWithoutCancellation(Case07Downstream $downstream): Generator
{
    $downstream->entered = true;
    while (!$downstream->released) yield 'blocked'; // No cancellation input.
}
// faultscope:end fs-c07.downstream-without-cancellation
