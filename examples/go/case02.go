package examplesgo

// JobStore is a synthetic protected resource. Its mutations are atomic in this model.
type JobStore struct {
	CurrentGeneration int
	State             string
	Result            string
}

func (s *JobStore) Takeover(generation int) {
	s.CurrentGeneration = generation
	s.State = "RUNNING"
}

// faultscope:begin fs-c02.commit-without-generation
func (s *JobStore) StoreResultWeak(result string) bool {
	if s.State != "RUNNING" {
		return false
	}
	s.Result = result // A7 can commit after B8 takes over while still RUNNING.
	return true
}

// faultscope:end fs-c02.commit-without-generation

// faultscope:begin fs-c02.commit-with-generation
func (s *JobStore) StoreResultGated(acquiredGeneration int, result string) bool {
	// This check and write are one atomic mutation at the protected Job Store.
	if s.State != "RUNNING" || acquiredGeneration != s.CurrentGeneration {
		return false
	}
	s.Result = result
	return true
}

// faultscope:end fs-c02.commit-with-generation

// faultscope:begin fs-c02.local-authority-check
func LocalLeaseCheckThenWeakCommit(leaseValid bool, s *JobStore, result string) bool {
	if !leaseValid {
		return false
	}
	// The lease can expire after this check and before StoreResultWeak.
	return s.StoreResultWeak(result)
}

// faultscope:end fs-c02.local-authority-check

// faultscope:begin fs-c02.current-generation-commit
func CommitCurrentWorker(s *JobStore, result string) bool {
	return s.StoreResultGated(8, result) // B8 makes progress under the same gate.
}

// faultscope:end fs-c02.current-generation-commit
