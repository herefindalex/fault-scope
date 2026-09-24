import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.atomic.AtomicBoolean;

final class Case07 {
    static final class CancelSignal {
        private final AtomicBoolean cancelled = new AtomicBoolean();
        private final CopyOnWriteArrayList<Runnable> listeners = new CopyOnWriteArrayList<>();
        boolean isCancelled() { return cancelled.get(); }
        void cancel() {
            if (cancelled.compareAndSet(false, true)) for (Runnable listener : listeners) listener.run();
        }
        Runnable onCancel(Runnable listener) {
            listeners.add(listener);
            if (isCancelled()) listener.run();
            return () -> listeners.remove(listener);
        }
    }

    private static int processBounded(int item) { return item * 2; }

    // faultscope:begin fs-c07.blocking-send-without-cancel
    static void blockingSendWithoutCancel(SynchronousQueue<Integer> out, int result,
                                          CountDownLatch entered) throws InterruptedException {
        entered.countDown();
        out.put(result); // No receiver: the cancel token cannot release this wait.
    }
    // faultscope:end fs-c07.blocking-send-without-cancel

    // faultscope:begin fs-c07.precheck-then-block
    static void precheckThenBlock(CancelSignal cancel, SynchronousQueue<Integer> out,
                                  int item, CountDownLatch entered) throws InterruptedException {
        if (cancel.isCancelled()) return;
        int result = processBounded(item);
        blockingSendWithoutCancel(out, result, entered);
    }
    // faultscope:end fs-c07.precheck-then-block

    // faultscope:begin fs-c07.blocking-send-with-cancel
    static boolean blockingSendWithCancel(CancelSignal cancel, SynchronousQueue<Integer> out,
                                          int result, CountDownLatch entered) throws InterruptedException {
        if (cancel.isCancelled()) return false;
        Runnable unregister = cancel.onCancel(Thread.currentThread()::interrupt);
        try {
            entered.countDown();
            out.put(result); // Cancellation interrupts this blocking operation.
            return true;
        } catch (InterruptedException interrupted) {
            if (cancel.isCancelled()) return false;
            throw interrupted;
        } finally {
            unregister.run();
        }
    }
    // faultscope:end fs-c07.blocking-send-with-cancel

    // faultscope:begin fs-c07.long-work-check-cancel
    static boolean longWorkCheckCancel(CancelSignal cancel, int units) {
        for (int index = 0; index < units; index++) {
            if (index % 1024 == 0 && cancel.isCancelled()) return false;
            int boundedUnit = index * index; // One bounded unit needs no check per instruction.
        }
        return true;
    }
    // faultscope:end fs-c07.long-work-check-cancel

    // faultscope:begin fs-c07.downstream-without-cancellation
    static void downstreamWithoutCancellation(CountDownLatch release, CountDownLatch entered)
            throws InterruptedException {
        entered.countDown();
        release.await(); // This API has no cancel token.
    }
    // faultscope:end fs-c07.downstream-without-cancellation
}
