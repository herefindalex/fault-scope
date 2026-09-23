#include <assert.h>
#include <string.h>
#include "case02.c"

int main(void) {
    Case02JobStore weak = {7, 1, 0};
    case02_takeover(&weak, 8); // B has not committed; still RUNNING.
    assert(case02_store_result_weak(&weak, "A7"));
    assert(strcmp(weak.result, "A7") == 0);
    Case02JobStore gated = {7, 1, 0};
    case02_takeover(&gated, 8);
    assert(!case02_store_result_gated(&gated, 7, "A7"));
    assert(gated.result == 0);
    assert(case02_commit_current_worker(&gated, "B8"));
    assert(strcmp(gated.result, "B8") == 0);
    return 0;
}
