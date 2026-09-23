package examplesgo

import "testing"

func TestGenerationGateRejectsStaleAndAllowsCurrent(t *testing.T) {
	weak := &JobStore{}
	weak.Takeover(7)
	weak.Takeover(8) // B8 has not committed; state is still RUNNING.
	if !weak.StoreResultWeak("A7") || weak.Result != "A7" {
		t.Fatal("weak store did not admit the stale counterexample")
	}
	strong := &JobStore{}
	strong.Takeover(7)
	strong.Takeover(8)
	if strong.StoreResultGated(7, "A7") || strong.Result != "" {
		t.Fatal("stale generation changed protected result")
	}
	if !CommitCurrentWorker(strong, "B8") || strong.Result != "B8" {
		t.Fatal("current generation could not make progress")
	}
}
