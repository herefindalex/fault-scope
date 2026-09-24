<?php

final class Case04RewardStore
{
    /** @var array{balance: array<string, int>, processed: array<string, bool>} */
    public array $state = ['balance' => [], 'processed' => []];

    public function add(string $userId, int $points): void
    {
        $this->state['balance'][$userId] = ($this->state['balance'][$userId] ?? 0) + $points;
    }
}

final class Case04DeliveryAck
{
    /** @var array<string, bool> */
    public array $accepted = [];
}

// faultscope:begin fs-c04.effect-then-ack
function case04WeakEffectThenAck(Case04RewardStore $store, Case04DeliveryAck $ack,
    string $eventId, string $userId, int $points, bool $crashBeforeAck): void
{
    $store->add($userId, $points); // Protected effect commits first.
    if ($crashBeforeAck) return; // Broker may redeliver E.
    $ack->accepted[$eventId] = true;
}
// faultscope:end fs-c04.effect-then-ack

// faultscope:begin fs-c04.ack-before-effect
function case04AckBeforeEffect(Case04RewardStore $store, Case04DeliveryAck $ack,
    string $eventId, string $userId, int $points, bool $crashAfterAck): void
{
    $ack->accepted[$eventId] = true;
    if ($crashAfterAck) return; // ACK survives; reward may be lost.
    $store->add($userId, $points);
}
// faultscope:end fs-c04.ack-before-effect

// faultscope:begin fs-c04.apply-event-once
function case04ApplyEventOnce(Case04RewardStore $store,
    string $eventId, string $userId, int $points): bool
{
    if (isset($store->state['processed'][$eventId])) return false;
    // Model one Rewards Store transaction with a single commit point.
    $next = $store->state;
    $next['processed'][$eventId] = true;
    $next['balance'][$userId] = ($next['balance'][$userId] ?? 0) + $points;
    $store->state = $next; // Identity and effect become visible together.
    return true;
}
// faultscope:end fs-c04.apply-event-once

// faultscope:begin fs-c04.redelivery-no-repeat
function case04HandleRewardDelivery(Case04RewardStore $store, Case04DeliveryAck $ack,
    string $eventId, string $userId, int $points): void
{
    case04ApplyEventOnce($store, $eventId, $userId, $points);
    $ack->accepted[$eventId] = true; // D2(E) can finish without another +100.
}
// faultscope:end fs-c04.redelivery-no-repeat

// faultscope:begin fs-c04.separate-dedupe-record
function case04SplitRewardAndMarker(Case04RewardStore $store, array &$marker,
    string $eventId, string $userId, int $points, bool $crashBeforeMarker): void
{
    if (isset($marker[$eventId])) return;
    $store->add($userId, $points); // Separate reward durability boundary.
    if ($crashBeforeMarker) return;
    $marker[$eventId] = true;
}
// faultscope:end fs-c04.separate-dedupe-record
