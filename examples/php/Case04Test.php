<?php

require_once __DIR__ . '/Case04.php';

function case04Require(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

$weak = new Case04RewardStore();
$weakAck = new Case04DeliveryAck();
case04WeakEffectThenAck($weak, $weakAck, 'E', 'User42', 100, true);
case04Require(!isset($weakAck->accepted['E']), 'pre-ACK crash was acknowledged');
case04WeakEffectThenAck($weak, $weakAck, 'E', 'User42', 100, false);
case04Require($weak->state['balance']['User42'] === 200, 'weak D1+D2 did not repeat');

$ackFirst = new Case04RewardStore();
$firstAck = new Case04DeliveryAck();
case04AckBeforeEffect($ackFirst, $firstAck, 'E', 'User42', 100, true);
case04Require(isset($firstAck->accepted['E']) && !isset($ackFirst->state['balance']['User42']),
    'ACK-first did not expose lost effect');

$strong = new Case04RewardStore();
case04Require(case04ApplyEventOnce($strong, 'E', 'User42', 100), 'new E suppressed');
case04Require(!case04ApplyEventOnce($strong, 'E', 'User42', 100), 'D2(E) applied');
$strongAck = new Case04DeliveryAck();
case04HandleRewardDelivery($strong, $strongAck, 'E', 'User42', 100);
case04Require($strong->state['balance']['User42'] === 100 && isset($strongAck->accepted['E']),
    'redelivery did not finish safely');

$split = new Case04RewardStore();
$marker = [];
case04SplitRewardAndMarker($split, $marker, 'E', 'User42', 100, true);
case04SplitRewardAndMarker($split, $marker, 'E', 'User42', 100, false);
case04Require($split->state['balance']['User42'] === 200, 'split marker did not repeat effect');
