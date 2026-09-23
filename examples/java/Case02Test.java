final class Case02Test {
    public static void main(String[] args) {
        Case02.JobStore weak = new Case02.JobStore();
        weak.takeover(8); // B has not committed; still RUNNING.
        if (!weak.storeResultWeak("A7") || !"A7".equals(weak.result)) throw new AssertionError("weak counterexample missing");
        Case02.JobStore gated = new Case02.JobStore();
        gated.takeover(8);
        if (gated.storeResultGated(7, "A7") || gated.result != null) throw new AssertionError("stale generation committed");
        if (!Case02.commitCurrentWorker(gated, "B8") || !"B8".equals(gated.result)) throw new AssertionError("current worker blocked");
    }
}
