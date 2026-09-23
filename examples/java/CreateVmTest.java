import java.util.HashSet;
import java.util.Set;

final class CreateVmTest {
    private static final class Receiver implements CreateVm.Client {
        private final boolean protect;
        private final Set<String> seen = new HashSet<>();
        int calls;
        int vms;

        Receiver(boolean protect) { this.protect = protect; }

        @Override public void createVM(String operationId, CreateVm.VmSpec spec) {
            calls++;
            if (!protect || seen.add(operationId)) vms++;
            if (calls == 1) throw new CreateVm.NoCompletionResponse();
        }
    }

    public static void main(String[] args) {
        var spec = new CreateVm.VmSpec("small");
        var weak = new Receiver(false);
        CreateVm.retryIndependent(weak, spec);
        if (weak.vms != 2) throw new AssertionError("weak repeat should permit two VMs");

        var strong = new Receiver(true);
        CreateVm.retrySameOperation(strong, spec, "P");
        if (strong.vms != 1) throw new AssertionError("same P should create one VM");

        var changed = new Receiver(true);
        CreateVm.retryWithNewOperation(changed, spec, "P", "Q");
        if (changed.vms != 2) throw new AssertionError("P then Q should permit two VMs");
    }
}
