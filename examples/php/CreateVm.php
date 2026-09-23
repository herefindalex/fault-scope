<?php
declare(strict_types=1);

final class NoCompletionResponse extends RuntimeException {}
final class Unresolved extends RuntimeException {}
interface VmClient { public function createVm(?string $operationId, string $size): void; }

// faultscope:begin fs-c01.retry-independent-attempt
function retryIndependent(VmClient $client, string $size): void {
    try { $client->createVm(null, $size); }
    catch (NoCompletionResponse $timeout) {
        $client->createVm(null, $size); // No repeat protection is documented.
    }
}
// faultscope:end fs-c01.retry-independent-attempt

// faultscope:begin fs-c01.keep-unresolved
function keepUnresolved(NoCompletionResponse $timeout): never {
    throw new Unresolved('Outcome unresolved', previous: $timeout);
}
// faultscope:end fs-c01.keep-unresolved

// faultscope:begin fs-c01.retry-same-logical-operation
function retrySameOperation(VmClient $client, string $size, string $p): void {
    try { $client->createVm($p, $size); }
    catch (NoCompletionResponse $timeout) {
        $client->createVm($p, $size); // Compatible repeat of P under the stronger contract.
    }
}
// faultscope:end fs-c01.retry-same-logical-operation

// faultscope:begin fs-c01.retry-with-new-logical-operation
function retryWithNewOperation(VmClient $client, string $size, string $p, string $q): void {
    try { $client->createVm($p, $size); }
    catch (NoCompletionResponse $timeout) {
        $client->createVm($q, $size); // Q is another logical operation.
    }
}
// faultscope:end fs-c01.retry-with-new-logical-operation
