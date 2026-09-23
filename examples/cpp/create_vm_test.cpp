#include <cassert>
#include <unordered_set>
#include "create_vm.cpp"

struct Receiver {
    bool protect;
    int calls = 0;
    int vms = 0;
    std::unordered_set<std::string> seen;

    explicit Receiver(bool value) : protect(value) {}

    VmOutcome operator()(std::optional<std::string> id, const VmSpec&) {
        calls++;
        const auto identity = id.value_or("");
        if (!protect || seen.insert(identity).second) vms++;
        return calls == 1 ? VmOutcome::no_completion_response : VmOutcome::ok;
    }
};

int main() {
    VmSpec spec{"small"};
    Receiver weak{false};
    assert(retry_independent([&](auto id, const auto& vm) { return weak(id, vm); }, spec) == VmOutcome::ok);
    assert(weak.vms == 2);

    Receiver strong{true};
    assert(retry_same_operation([&](auto id, const auto& vm) { return strong(id, vm); }, spec, "P") == VmOutcome::ok);
    assert(strong.vms == 1);

    Receiver changed{true};
    assert(retry_with_new_operation([&](auto id, const auto& vm) { return changed(id, vm); }, spec, "P", "Q") == VmOutcome::ok);
    assert(changed.vms == 2);
}
