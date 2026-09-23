#include <functional>
#include <optional>
#include <string>

enum class VmOutcome { ok, no_completion_response, other_error, unresolved };
struct VmSpec { std::string size; };
using CreateVm = std::function<VmOutcome(std::optional<std::string>, const VmSpec&)>;

// faultscope:begin fs-c01.retry-independent-attempt
VmOutcome retry_independent(const CreateVm& create_vm, const VmSpec& spec) {
    auto result = create_vm(std::nullopt, spec);
    if (result == VmOutcome::no_completion_response) {
        return create_vm(std::nullopt, spec); // No repeat protection is documented.
    }
    return result;
}
// faultscope:end fs-c01.retry-independent-attempt

// faultscope:begin fs-c01.keep-unresolved
VmOutcome keep_unresolved(VmOutcome result) {
    return result == VmOutcome::no_completion_response ? VmOutcome::unresolved : result;
}
// faultscope:end fs-c01.keep-unresolved

// faultscope:begin fs-c01.retry-same-logical-operation
VmOutcome retry_same_operation(const CreateVm& create_vm, const VmSpec& spec, const std::string& p) {
    auto result = create_vm(p, spec);
    if (result == VmOutcome::no_completion_response) {
        return create_vm(p, spec); // Same P under the stronger contract.
    }
    return result;
}
// faultscope:end fs-c01.retry-same-logical-operation

// faultscope:begin fs-c01.retry-with-new-logical-operation
VmOutcome retry_with_new_operation(const CreateVm& create_vm, const VmSpec& spec,
                                   const std::string& p, const std::string& q) {
    auto result = create_vm(p, spec);
    if (result == VmOutcome::no_completion_response) {
        return create_vm(q, spec); // Q is another logical operation.
    }
    return result;
}
// faultscope:end fs-c01.retry-with-new-logical-operation
