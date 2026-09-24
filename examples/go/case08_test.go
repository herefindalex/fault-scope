package examplesgo

import "testing"

func TestCase08RecoveryBoundary(t *testing.T) {
	weakStore := &RecoveryStore{}
	before := &WeakRecoveryProjection{store: weakStore}
	if !before.Apply(RecoveryRecord{"SHIPPED", 44}) || before.Apply(RecoveryRecord{"PROCESSING", 42}) {
		t.Fatal("the live guard should reject revision 42")
	}
	if weakStore.record.State != "SHIPPED" {
		t.Fatal("revision 44 value should survive")
	}
	after := &WeakRecoveryProjection{store: weakStore}
	if !after.Apply(RecoveryRecord{"PROCESSING", 42}) || weakStore.record.State != "PROCESSING" {
		t.Fatal("the memory-only guard is lost and permits regression")
	}

	strongStore := &RecoveryStore{}
	PersistRecoveryRecord(strongStore, RecoveryRecord{"SHIPPED", 44})
	recovered := RecoverStateWithRevision(strongStore)
	if !recovered.ready || recovered.Apply(RecoveryRecord{"PROCESSING", 42}) {
		t.Fatal("recovered revision 44 must reject revision 42")
	}
	if strongStore.record != (RecoveryRecord{"SHIPPED", 44}) {
		t.Fatal("stale event must not change the durable record")
	}
	if !recovered.Apply(RecoveryRecord{"DELIVERED", 45}) || strongStore.record != (RecoveryRecord{"DELIVERED", 45}) {
		t.Fatal("revision 45 must advance state and revision together")
	}

	rebuilt := RebuildBeforeReady([]RecoveryRecord{{"PROCESSING", 42}, {"SHIPPED", 44}})
	if !rebuilt.ready || rebuilt.Apply(RecoveryRecord{"PROCESSING", 42}) {
		t.Fatal("complete replay must rebuild the revision before readiness")
	}
}
