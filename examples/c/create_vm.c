#include <stddef.h>

typedef enum { VM_OK, VM_NO_COMPLETION_RESPONSE, VM_OTHER_ERROR, VM_UNRESOLVED } VmOutcome;
typedef struct { const char *size; } VmSpec;
typedef VmOutcome (*CreateVm)(void *context, const char *operation_id, VmSpec spec);
typedef struct { void *context; CreateVm create_vm; } VmClient;

// faultscope:begin fs-c01.retry-independent-attempt
VmOutcome retry_independent(VmClient client, VmSpec spec) {
    VmOutcome result = client.create_vm(client.context, NULL, spec);
    if (result == VM_NO_COMPLETION_RESPONSE) {
        return client.create_vm(client.context, NULL, spec); // No repeat protection is documented.
    }
    return result;
}
// faultscope:end fs-c01.retry-independent-attempt

// faultscope:begin fs-c01.keep-unresolved
VmOutcome keep_unresolved(VmOutcome result) {
    return result == VM_NO_COMPLETION_RESPONSE ? VM_UNRESOLVED : result;
}
// faultscope:end fs-c01.keep-unresolved

// faultscope:begin fs-c01.retry-same-logical-operation
VmOutcome retry_same_operation(VmClient client, VmSpec spec, const char *p) {
    VmOutcome result = client.create_vm(client.context, p, spec);
    if (result == VM_NO_COMPLETION_RESPONSE) {
        return client.create_vm(client.context, p, spec); // Same P under stronger contract.
    }
    return result;
}
// faultscope:end fs-c01.retry-same-logical-operation

// faultscope:begin fs-c01.retry-with-new-logical-operation
VmOutcome retry_with_new_operation(VmClient client, VmSpec spec, const char *p, const char *q) {
    VmOutcome result = client.create_vm(client.context, p, spec);
    if (result == VM_NO_COMPLETION_RESPONSE) {
        return client.create_vm(client.context, q, spec); // Q is another logical operation.
    }
    return result;
}
// faultscope:end fs-c01.retry-with-new-logical-operation
