#include <assert.h>
#include "case03.c"

static int record_publish(void *context, const char *event) {
    int *count = context;
    assert(event[0] == 'E');
    (*count)++;
    return 1;
}
int main(void) {
    Case03OrderDb weak = {0, 0, 0};
    case03_commit_business_state_only(&weak); /* Process stops before publish is invoked. */
    assert(weak.confirmed && !weak.outbox_pending);
    Case03OrderDb rolled_back = {0, 0, 0};
    assert(!case03_confirm_with_outbox(&rolled_back, 1));
    assert(!rolled_back.confirmed && !rolled_back.outbox_pending);
    Case03OrderDb repaired = {0, 0, 0};
    assert(case03_confirm_with_outbox(&repaired, 0));
    assert(repaired.confirmed && repaired.outbox_pending);
    int events = 0;
    assert(case03_relay_publish_pending(&repaired, record_publish, &events));
    assert(case03_relay_publish_pending(&repaired, record_publish, &events));
    assert(events == 2); // Relay crashed before marking SENT.
    case03_mark_publication_complete(&repaired);
    assert(case03_relay_publish_pending(&repaired, record_publish, &events));
    assert(events == 2);
    return 0;
}
