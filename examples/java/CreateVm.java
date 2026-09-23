import java.util.Objects;

final class CreateVm {
    record VmSpec(String size) {}
    interface Client { void createVM(String operationId, VmSpec spec) throws NoCompletionResponse; }
    static final class NoCompletionResponse extends RuntimeException {}
    static final class Unresolved extends RuntimeException {}

    // faultscope:begin fs-c01.retry-independent-attempt
    static void retryIndependent(Client client, VmSpec spec) {
        try { client.createVM(null, spec); }
        catch (NoCompletionResponse timeout) {
            client.createVM(null, spec); // No repeat protection is documented.
        }
    }
    // faultscope:end fs-c01.retry-independent-attempt

    // faultscope:begin fs-c01.keep-unresolved
    static void keepUnresolved(NoCompletionResponse timeout) {
        throw new Unresolved(); // No response does not establish no VM.
    }
    // faultscope:end fs-c01.keep-unresolved

    // faultscope:begin fs-c01.retry-same-logical-operation
    static void retrySameOperation(Client client, VmSpec spec, String p) {
        Objects.requireNonNull(p);
        try { client.createVM(p, spec); }
        catch (NoCompletionResponse timeout) {
            client.createVM(p, spec); // Compatible repeat of P under the stronger contract.
        }
    }
    // faultscope:end fs-c01.retry-same-logical-operation

    // faultscope:begin fs-c01.retry-with-new-logical-operation
    static void retryWithNewOperation(Client client, VmSpec spec, String p, String q) {
        try { client.createVM(p, spec); }
        catch (NoCompletionResponse timeout) {
            client.createVM(q, spec); // Q is another logical operation.
        }
    }
    // faultscope:end fs-c01.retry-with-new-logical-operation
}
