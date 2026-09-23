<?php
declare(strict_types=1);
require __DIR__ . '/CreateVm.php';

final class FakeVmClient implements VmClient {
    public int $vms = 0;
    private int $calls = 0;
    private array $seen = [];

    public function __construct(private bool $protect) {}

    public function createVm(?string $operationId, string $size): void {
        $this->calls++;
        $key = $operationId ?? '';
        if (!$this->protect || !isset($this->seen[$key])) {
            $this->vms++;
            $this->seen[$key] = true;
        }
        if ($this->calls === 1) throw new NoCompletionResponse();
    }
}

$weak = new FakeVmClient(false);
retryIndependent($weak, 'small');
if ($weak->vms !== 2) throw new RuntimeException('weak repeat should permit two VMs');

$strong = new FakeVmClient(true);
retrySameOperation($strong, 'small', 'P');
if ($strong->vms !== 1) throw new RuntimeException('same P should create one VM');

$changed = new FakeVmClient(true);
retryWithNewOperation($changed, 'small', 'P', 'Q');
if ($changed->vms !== 2) throw new RuntimeException('P then Q should permit two VMs');
