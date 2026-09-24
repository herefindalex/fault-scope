package examplesgo

// RecoveryRecord is the business value and the revision that authorized it.
type RecoveryRecord struct {
	State    string
	Revision int
}

type RecoveryStore struct{ record RecoveryRecord }

type WeakRecoveryProjection struct {
	store *RecoveryStore
	guard int // Lost when the process restarts.
}

// faultscope:begin fs-c08.memory-only-revision
func (p *WeakRecoveryProjection) Apply(event RecoveryRecord) bool {
	if event.Revision <= p.guard {
		return false
	}
	p.store.record.State = event.State // Only the business value is durable.
	p.guard = event.Revision
	return true
}
// faultscope:end fs-c08.memory-only-revision

// faultscope:begin fs-c08.persist-state-with-revision
func PersistRecoveryRecord(store *RecoveryStore, next RecoveryRecord) {
	store.record = next // One atomic durable record in this model.
}
// faultscope:end fs-c08.persist-state-with-revision

type StrongRecoveryProjection struct {
	store   *RecoveryStore
	current RecoveryRecord
	ready   bool
}

// faultscope:begin fs-c08.recover-state-with-revision
func RecoverStateWithRevision(store *RecoveryStore) *StrongRecoveryProjection {
	projection := &StrongRecoveryProjection{store: store}
	projection.current = store.record // Restore state and revision together.
	projection.ready = true           // Only after recovery may events be applied.
	return projection
}
// faultscope:end fs-c08.recover-state-with-revision

// faultscope:begin fs-c08.reject-stale-after-restart
func (p *StrongRecoveryProjection) Apply(event RecoveryRecord) bool {
	if !p.ready || event.Revision <= p.current.Revision {
		return false
	}
	PersistRecoveryRecord(p.store, event)
	p.current = event
	return true
}
// faultscope:end fs-c08.reject-stale-after-restart

// faultscope:begin fs-c08.rebuild-before-ready
func RebuildBeforeReady(history []RecoveryRecord) *StrongRecoveryProjection {
	store := &RecoveryStore{}
	projection := &StrongRecoveryProjection{store: store}
	for _, event := range history { // Complete authoritative history; no external effects here.
		if event.Revision > projection.current.Revision {
			PersistRecoveryRecord(store, event)
			projection.current = event
		}
	}
	projection.ready = true
	return projection
}
// faultscope:end fs-c08.rebuild-before-ready
