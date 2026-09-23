#include <assert.h>
#include <string.h>
#include "create_vm.c"

typedef struct {
    int protect;
    int calls;
    int vms;
    const char *seen[2];
    int seen_count;
} Receiver;

static VmOutcome create_vm(void *context, const char *operation_id, VmSpec spec) {
    Receiver *receiver = context;
    int known = 0;
    (void)spec;
    receiver->calls++;
    for (int i = 0; i < receiver->seen_count; i++) {
        if (operation_id && strcmp(receiver->seen[i], operation_id) == 0) known = 1;
    }
    if (!receiver->protect || !known) {
        receiver->vms++;
        if (receiver->protect && operation_id) receiver->seen[receiver->seen_count++] = operation_id;
    }
    return receiver->calls == 1 ? VM_NO_COMPLETION_RESPONSE : VM_OK;
}

int main(void) {
    VmSpec spec = {"small"};
    Receiver weak = {0};
    assert(retry_independent((VmClient){&weak, create_vm}, spec) == VM_OK);
    assert(weak.vms == 2);

    Receiver strong = {.protect = 1};
    assert(retry_same_operation((VmClient){&strong, create_vm}, spec, "P") == VM_OK);
    assert(strong.vms == 1);

    Receiver changed = {.protect = 1};
    assert(retry_with_new_operation((VmClient){&changed, create_vm}, spec, "P", "Q") == VM_OK);
    assert(changed.vms == 2);
    return 0;
}
