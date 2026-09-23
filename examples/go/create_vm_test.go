package examplesgo

import (
	"context"
	"testing"
)

type receiver struct {
	protect bool
	seen    map[string]bool
	vms     int
	calls   int
}

func (r *receiver) CreateVM(_ context.Context, id string, _ VM) error {
	r.calls++
	if !r.protect || !r.seen[id] {
		r.vms++
		r.seen[id] = true
	}
	if r.calls == 1 {
		return ErrDeadline // Effect happened; response unavailable.
	}
	return nil
}

func TestRepresentativeCounterexampleAndContract(t *testing.T) {
	weak := &receiver{seen: map[string]bool{}}
	if err := RetryIndependent(context.Background(), weak, VM{Size: "small"}); err != nil || weak.vms != 2 {
		t.Fatalf("weak repeat: err=%v, VMs=%d", err, weak.vms)
	}
	strong := &receiver{protect: true, seen: map[string]bool{}}
	if err := RetrySameOperation(context.Background(), strong, VM{Size: "small"}, "P"); err != nil || strong.vms != 1 {
		t.Fatalf("same P: err=%v, VMs=%d", err, strong.vms)
	}
	changed := &receiver{protect: true, seen: map[string]bool{}}
	if err := RetryWithNewOperation(context.Background(), changed, VM{Size: "small"}, "P", "Q"); err != nil || changed.vms != 2 {
		t.Fatalf("P then Q: err=%v, VMs=%d", err, changed.vms)
	}
}
