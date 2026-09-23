#include <cassert>
#include "case02.cpp"

int main() {
    Case02JobStore weak;
    weak.takeover(8); // B has not committed; still RUNNING.
    assert(weak.store_result_weak("A7"));
    assert(weak.result == "A7");
    Case02JobStore gated;
    gated.takeover(8);
    assert(!gated.store_result_gated(7, "A7"));
    assert(gated.result.empty());
    assert(case02_commit_current_worker(gated, "B8"));
    assert(gated.result == "B8");
}
