final class Case02 {
    static final class JobStore {
        int currentGeneration = 7;
        String state = "RUNNING";
        String result;

        void takeover(int generation) { currentGeneration = generation; }

        // faultscope:begin fs-c02.commit-without-generation
        synchronized boolean storeResultWeak(String value) {
            if (!state.equals("RUNNING")) return false;
            result = value; // A7 can commit after B8 takes over.
            return true;
        }
        // faultscope:end fs-c02.commit-without-generation

        // faultscope:begin fs-c02.commit-with-generation
        synchronized boolean storeResultGated(int acquiredGeneration, String value) {
            // Check and write atomically at the protected Job Store.
            if (!state.equals("RUNNING") || acquiredGeneration != currentGeneration) return false;
            result = value;
            return true;
        }
        // faultscope:end fs-c02.commit-with-generation
    }

    // faultscope:begin fs-c02.local-authority-check
    static boolean localCheckThenWeakCommit(boolean leaseValid, JobStore store, String value) {
        if (!leaseValid) return false;
        // A takeover may occur after this local check.
        return store.storeResultWeak(value);
    }
    // faultscope:end fs-c02.local-authority-check

    // faultscope:begin fs-c02.current-generation-commit
    static boolean commitCurrentWorker(JobStore store, String value) {
        return store.storeResultGated(8, value); // B8 still makes progress.
    }
    // faultscope:end fs-c02.current-generation-commit
}
