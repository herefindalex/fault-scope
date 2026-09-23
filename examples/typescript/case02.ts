// Synthetic protected Job Store: each method is one atomic mutation.
export class JobStore {
  currentGeneration = 7;
  state = "RUNNING";
  result: string | null = null;

  takeover(generation: number): void {
    this.currentGeneration = generation;
  }

  // faultscope:begin fs-c02.commit-without-generation
  storeResultWeak(result: string): boolean {
    if (this.state !== "RUNNING") return false;
    this.result = result; // A7 can commit even after B8 takes over.
    return true;
  }
  // faultscope:end fs-c02.commit-without-generation

  // faultscope:begin fs-c02.commit-with-generation
  storeResultGated(acquiredGeneration: number, result: string): boolean {
    // Compare and write atomically at the protected resource.
    if (this.state !== "RUNNING" || acquiredGeneration !== this.currentGeneration) {
      return false;
    }
    this.result = result;
    return true;
  }
  // faultscope:end fs-c02.commit-with-generation
}

// faultscope:begin fs-c02.local-authority-check
export function localCheckThenWeakCommit(
  leaseValid: boolean,
  store: JobStore,
  result: string,
): boolean {
  if (!leaseValid) return false;
  // A takeover can happen after this local check.
  return store.storeResultWeak(result);
}
// faultscope:end fs-c02.local-authority-check

// faultscope:begin fs-c02.current-generation-commit
export function commitCurrentWorker(store: JobStore, result: string): boolean {
  return store.storeResultGated(8, result); // B8 still makes progress.
}
// faultscope:end fs-c02.current-generation-commit
