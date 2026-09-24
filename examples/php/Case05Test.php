<?php
declare(strict_types=1);

require_once __DIR__ . '/Case05.php';

$e42 = new Case05Change('Shipment42', 42, 'PROCESSING');
$e43 = new Case05Change('Shipment42', 43, 'SHIPPED');
$e44 = new Case05Change('Shipment42', 44, 'DELIVERED');
$weak = new Case05Projection();
case05ApplyOnArrival($weak, $e43);
case05ApplyOnArrival($weak, $e42);
if ($weak->records['Shipment42'] !== $e42) throw new RuntimeException('weak projection did not regress');

$strong = new Case05Projection();
if (!case05ApplyIfNewer($strong, $e43) || case05ApplyIfNewer($strong, $e42)) {
    throw new RuntimeException('source revision guard failed');
}
if ($strong->records['Shipment42'] !== $e43 || case05ApplyIfNewer($strong, $e43)) {
    throw new RuntimeException('duplicate or stale arrival changed state');
}
if (!case05ApplyIfNewer($strong, $e44) || $strong->records['Shipment42'] !== $e44) {
    throw new RuntimeException('newer revision did not advance');
}
if (!case05ApplyIfNewer($strong, new Case05Change('Shipment99', 100, 'CREATED'))
    || $strong->records['Shipment42'] !== $e44) {
    throw new RuntimeException('other entity changed Shipment42');
}
$tags = [];
foreach (['fragile', 'priority', 'fragile'] as $tag) case05AddShipmentTag($tags, $tag);
if (count($tags) !== 2) throw new RuntimeException('set union should be order independent');
