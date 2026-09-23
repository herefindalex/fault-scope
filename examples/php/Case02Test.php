<?php
declare(strict_types=1);
require_once __DIR__ . '/Case02.php';

$weak = new Case02JobStore();
$weak->takeover(8); // B has not committed; still RUNNING.
if (!$weak->storeResultWeak('A7') || $weak->result !== 'A7') throw new RuntimeException('weak counterexample missing');
$gated = new Case02JobStore();
$gated->takeover(8);
if ($gated->storeResultGated(7, 'A7') || $gated->result !== null) throw new RuntimeException('stale generation committed');
if (!commitCurrentWorker($gated, 'B8') || $gated->result !== 'B8') throw new RuntimeException('current worker blocked');
