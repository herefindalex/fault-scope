<?php
declare(strict_types=1);

final class Case02JobStore {
    public int $currentGeneration = 7;
    public string $state = 'RUNNING';
    public ?string $result = null;

    public function takeover(int $generation): void { $this->currentGeneration = $generation; }

    // faultscope:begin fs-c02.commit-without-generation
    public function storeResultWeak(string $value): bool {
        if ($this->state !== 'RUNNING') return false;
        $this->result = $value; // A7 can commit after B8 takes over.
        return true;
    }
    // faultscope:end fs-c02.commit-without-generation

    // faultscope:begin fs-c02.commit-with-generation
    public function storeResultGated(int $acquiredGeneration, string $value): bool {
        // This check and mutation are atomic at the protected Job Store.
        if ($this->state !== 'RUNNING' || $acquiredGeneration !== $this->currentGeneration) return false;
        $this->result = $value;
        return true;
    }
    // faultscope:end fs-c02.commit-with-generation
}

// faultscope:begin fs-c02.local-authority-check
function localCheckThenWeakCommit(bool $leaseValid, Case02JobStore $store, string $value): bool {
    if (!$leaseValid) return false;
    // A takeover may occur after this local check.
    return $store->storeResultWeak($value);
}
// faultscope:end fs-c02.local-authority-check

// faultscope:begin fs-c02.current-generation-commit
function commitCurrentWorker(Case02JobStore $store, string $value): bool {
    return $store->storeResultGated(8, $value); // B8 still makes progress.
}
// faultscope:end fs-c02.current-generation-commit
