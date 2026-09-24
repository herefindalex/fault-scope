export type RecoveryRecord = { state: string; revision: number };
export type RecoveryStore = { record: RecoveryRecord };

export class WeakRecoveryProjection {
  private guard = 0; // New process starts with no revision evidence.
  private readonly store: RecoveryStore;
  constructor(store: RecoveryStore) { this.store = store; }

  // faultscope:begin fs-c08.memory-only-revision
  apply(event: RecoveryRecord): boolean {
    if (event.revision <= this.guard) return false;
    this.store.record = { ...this.store.record, state: event.state }; // Revision is not saved.
    this.guard = event.revision;
    return true;
  }
  // faultscope:end fs-c08.memory-only-revision
}

// faultscope:begin fs-c08.persist-state-with-revision
export function persistStateWithRevision(store: RecoveryStore, next: RecoveryRecord): void {
  store.record = { ...next }; // One atomic durable record in this model.
}
// faultscope:end fs-c08.persist-state-with-revision

export class StrongRecoveryProjection {
  private ready = false;
  private current: RecoveryRecord = { state: "", revision: 0 };
  private readonly store: RecoveryStore;
  private constructor(store: RecoveryStore) { this.store = store; }

  // faultscope:begin fs-c08.recover-state-with-revision
  static recover(store: RecoveryStore): StrongRecoveryProjection {
    const projection = new StrongRecoveryProjection(store);
    projection.current = { ...store.record }; // Restore value and revision together.
    projection.ready = true; // Only then can the projection accept events.
    return projection;
  }
  // faultscope:end fs-c08.recover-state-with-revision

  // faultscope:begin fs-c08.reject-stale-after-restart
  apply(event: RecoveryRecord): boolean {
    if (!this.ready || event.revision <= this.current.revision) return false;
    persistStateWithRevision(this.store, event);
    this.current = { ...event };
    return true;
  }
  // faultscope:end fs-c08.reject-stale-after-restart
}

// faultscope:begin fs-c08.rebuild-before-ready
export function rebuildBeforeReady(history: RecoveryRecord[]): StrongRecoveryProjection {
  const store: RecoveryStore = { record: { state: "", revision: 0 } };
  for (const event of history) { // Complete authoritative history; no external effects here.
    if (event.revision > store.record.revision) persistStateWithRevision(store, event);
  }
  return StrongRecoveryProjection.recover(store); // Readiness follows replay.
}
// faultscope:end fs-c08.rebuild-before-ready
