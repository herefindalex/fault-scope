type PendingSend = { value: number; finish: () => void };

// A one-slot rendezvous models a request-scoped result handoff.
export class ResultHandoff {
  private pending: PendingSend | null = null;
  private receiver: ((value: number) => void) | null = null;

  hasPending(): boolean { return this.pending !== null; }

  receive(): Promise<number> {
    if (this.pending) {
      const send = this.pending;
      this.pending = null;
      send.finish();
      return Promise.resolve(send.value);
    }
    return new Promise((resolve) => { this.receiver = resolve; });
  }

  // faultscope:begin fs-c07.blocking-send-without-cancel
  sendWithoutCancel(value: number): Promise<void> {
    if (this.receiver) {
      const receive = this.receiver;
      this.receiver = null;
      receive(value);
      return Promise.resolve();
    }
    return new Promise((resolve) => { this.pending = { value, finish: resolve }; });
  }
  // faultscope:end fs-c07.blocking-send-without-cancel

  // faultscope:begin fs-c07.blocking-send-with-cancel
  sendWithCancel(value: number, signal: AbortSignal): Promise<void> {
    if (signal.aborted) return Promise.reject(new Error("CANCELLED"));
    if (this.receiver) {
      const receive = this.receiver;
      this.receiver = null;
      receive(value);
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const onAbort = () => {
        if (this.pending === send) this.pending = null;
        reject(new Error("CANCELLED"));
      };
      const send: PendingSend = {
        value,
        finish: () => { signal.removeEventListener("abort", onAbort); resolve(); },
      };
      this.pending = send;
      signal.addEventListener("abort", onAbort, { once: true });
    });
  }
  // faultscope:end fs-c07.blocking-send-with-cancel
}

function processBounded(item: number): number { return item * 2; }

// faultscope:begin fs-c07.precheck-then-block
export async function precheckThenBlock(signal: AbortSignal, handoff: ResultHandoff, item: number): Promise<void> {
  if (signal.aborted) throw new Error("CANCELLED");
  const result = processBounded(item);
  await handoff.sendWithoutCancel(result); // Later abort cannot release this wait.
}
// faultscope:end fs-c07.precheck-then-block

// faultscope:begin fs-c07.long-work-check-cancel
export function longWorkCheckCancel(signal: AbortSignal, units: number): void {
  for (let i = 0; i < units; i++) {
    if (i % 1024 === 0 && signal.aborted) throw new Error("CANCELLED");
    void (i * i); // One bounded unit needs no check at every instruction.
  }
}
// faultscope:end fs-c07.long-work-check-cancel

// faultscope:begin fs-c07.downstream-without-cancellation
export async function downstreamWithoutCancellation(release: Promise<void>): Promise<void> {
  await release; // This API has no AbortSignal input.
}
// faultscope:end fs-c07.downstream-without-cancellation
