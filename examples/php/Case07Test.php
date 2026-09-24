<?php
declare(strict_types=1);

require_once __DIR__ . '/Case07.php';

$weakCancel = new Case07CancelSignal();
$weakHandoff = new Case07Handoff();
$weak = case07PrecheckThenBlock($weakCancel, $weakHandoff, 21);
$weak->rewind();
if (!$weakHandoff->waiting || !$weak->valid()) throw new RuntimeException('weak send did not block');
$weakCancel->cancel();
$weak->next();
if (!$weak->valid()) throw new RuntimeException('weak send should stay blocked after cancel');
$weakHandoff->receiverReady = true; // Clean up the intentional weak block.
$weak->next();
if ($weak->valid() || $weakHandoff->accepted !== 42) throw new RuntimeException('weak cleanup failed');

$strongCancel = new Case07CancelSignal();
$strongHandoff = new Case07Handoff();
$strong = case07BlockingSendWithCancel($strongCancel, $strongHandoff, 42);
$strong->rewind();
if (!$strong->valid()) throw new RuntimeException('strong send did not wait');
$strongCancel->cancel();
$strong->next();
if ($strong->valid() || $strong->getReturn() !== false) throw new RuntimeException('strong send did not cancel');

$readyCancel = new Case07CancelSignal();
$readyHandoff = new Case07Handoff();
$readyHandoff->receiverReady = true;
$ready = case07BlockingSendWithCancel($readyCancel, $readyHandoff, 42);
$ready->rewind();
if ($ready->valid() || $ready->getReturn() !== true) throw new RuntimeException('ready receiver should succeed');
$readyCancel->cancel();
if ($readyHandoff->accepted !== 42) throw new RuntimeException('late cancel changed result');
if (case07LongWorkCheckCancel($strongCancel, 100000)) throw new RuntimeException('long work ignored cancel');

$downstream = new Case07Downstream();
$waiting = case07DownstreamWithoutCancellation($downstream);
$waiting->rewind();
if (!$downstream->entered || !$waiting->valid()) throw new RuntimeException('downstream did not block');
$downstream->released = true;
$waiting->next();
if ($waiting->valid()) throw new RuntimeException('downstream cleanup failed');
