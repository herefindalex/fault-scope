type VmSpec = { size: string };
type Client = { createVM(operationId: string | null, spec: VmSpec): Promise<void> };
class NoCompletionResponse extends Error {}
class Unresolved extends Error {}

// faultscope:begin fs-c01.retry-independent-attempt
export async function retryIndependent(client: Client, spec: VmSpec): Promise<void> {
  try { await client.createVM(null, spec); }
  catch (error) {
    if (!(error instanceof NoCompletionResponse)) throw error;
    await client.createVM(null, spec); // No repeat protection is documented.
  }
}
// faultscope:end fs-c01.retry-independent-attempt

// faultscope:begin fs-c01.keep-unresolved
export function keepUnresolved(error: unknown): never {
  if (error instanceof NoCompletionResponse) throw new Unresolved('Outcome unresolved');
  throw error;
}
// faultscope:end fs-c01.keep-unresolved

// faultscope:begin fs-c01.retry-same-logical-operation
export async function retrySameOperation(client: Client, spec: VmSpec, p: string): Promise<void> {
  try { await client.createVM(p, spec); }
  catch (error) {
    if (!(error instanceof NoCompletionResponse)) throw error;
    await client.createVM(p, spec); // Compatible repeat of P under the stronger contract.
  }
}
// faultscope:end fs-c01.retry-same-logical-operation

// faultscope:begin fs-c01.retry-with-new-logical-operation
export async function retryWithNewOperation(client: Client, spec: VmSpec, p: string, q: string): Promise<void> {
  try { await client.createVM(p, spec); }
  catch (error) {
    if (!(error instanceof NoCompletionResponse)) throw error;
    await client.createVM(q, spec); // Q is a different logical operation.
  }
}
// faultscope:end fs-c01.retry-with-new-logical-operation
