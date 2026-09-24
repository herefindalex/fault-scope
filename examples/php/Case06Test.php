<?php
declare(strict_types=1);

require_once __DIR__ . '/Case06.php';

$projection = new Case06Projection();
$projection->put(new Case06Snapshot('Product42', 43, 100));
if (case06ReadCurrentProjection($projection, 'Product42')->snapshot->revision !== 43)
    throw new RuntimeException('ordinary read may return revision 43');
if (case06SleepBeforeRead($projection, 'Product42', 0)->snapshot->revision !== 43)
    throw new RuntimeException('fixed sleep did not prove revision 44');
if (case06ReadAtLeastRevision($projection, 'Product42', 44)->status !== 'NOT_FRESH_ENOUGH')
    throw new RuntimeException('43 cannot satisfy minimum 44');
if (case06ReadAtLeastRevision($projection, 'Product42', 0)->snapshot->revision !== 43)
    throw new RuntimeException('eventual read may return 43');
$projection->put(new Case06Snapshot('Product42', 44, 120));
if (case06ReadAtLeastRevision($projection, 'Product42', 44)->snapshot->revision !== 44)
    throw new RuntimeException('44 should satisfy minimum 44');
$projection->put(new Case06Snapshot('Product42', 45, 125));
if (case06ReadAtLeastRevision($projection, 'Product42', 44)->snapshot->price !== 125)
    throw new RuntimeException('45 should satisfy minimum 44');
$cache = new Case06Projection();
$cache->put(new Case06Snapshot('Product42', 43, 100));
if (case06ReadAtLeastRevision($cache, 'Product42', 44)->status !== 'NOT_FRESH_ENOUGH')
    throw new RuntimeException('cache must enforce minimum 44 too');
