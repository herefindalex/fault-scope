import java.util.concurrent.CountDownLatch;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

final class Case07Test {
    public static void main(String[] args) throws Exception {
        Case07.CancelSignal weakCancel = new Case07.CancelSignal();
        SynchronousQueue<Integer> weakOut = new SynchronousQueue<>();
        CountDownLatch weakEntered = new CountDownLatch(1);
        Thread weak = new Thread(() -> {
            try { Case07.precheckThenBlock(weakCancel, weakOut, 21, weakEntered); }
            catch (InterruptedException e) { throw new AssertionError(e); }
        });
        weak.start();
        if (!weakEntered.await(1, TimeUnit.SECONDS)) throw new AssertionError("weak send not entered");
        weakCancel.cancel();
        if (!weak.isAlive()) throw new AssertionError("weak send should remain blocked");
        if (weakOut.take() != 42) throw new AssertionError("cleanup receiver got wrong result");
        weak.join(1000);
        if (weak.isAlive()) throw new AssertionError("weak cleanup failed");

        Case07.CancelSignal strongCancel = new Case07.CancelSignal();
        CountDownLatch strongEntered = new CountDownLatch(1);
        AtomicBoolean strongResult = new AtomicBoolean(true);
        Thread strong = new Thread(() -> {
            try { strongResult.set(Case07.blockingSendWithCancel(strongCancel, new SynchronousQueue<>(), 42, strongEntered)); }
            catch (InterruptedException e) { throw new AssertionError(e); }
        });
        strong.start();
        if (!strongEntered.await(1, TimeUnit.SECONDS)) throw new AssertionError("strong send not entered");
        strongCancel.cancel();
        strong.join(1000);
        if (strong.isAlive() || strongResult.get()) throw new AssertionError("strong send did not cancel");

        Case07.CancelSignal readyCancel = new Case07.CancelSignal();
        SynchronousQueue<Integer> readyOut = new SynchronousQueue<>();
        CountDownLatch readyEntered = new CountDownLatch(1);
        AtomicInteger delivered = new AtomicInteger();
        Thread receiver = new Thread(() -> {
            try { delivered.set(readyOut.take()); }
            catch (InterruptedException e) { throw new AssertionError(e); }
        });
        receiver.start();
        if (!Case07.blockingSendWithCancel(readyCancel, readyOut, 42, readyEntered))
            throw new AssertionError("ready receiver should complete handoff");
        receiver.join(1000);
        readyCancel.cancel(); // Late cancel does not undo delivery.
        if (receiver.isAlive() || delivered.get() != 42) throw new AssertionError("late cancel changed result");
        if (Case07.longWorkCheckCancel(strongCancel, 100000)) throw new AssertionError("long work ignored cancel");

        CountDownLatch release = new CountDownLatch(1), entered = new CountDownLatch(1);
        Thread downstream = new Thread(() -> {
            try { Case07.downstreamWithoutCancellation(release, entered); }
            catch (InterruptedException e) { throw new AssertionError(e); }
        });
        downstream.start();
        if (!entered.await(1, TimeUnit.SECONDS) || !downstream.isAlive())
            throw new AssertionError("downstream did not block");
        release.countDown();
        downstream.join(1000);
        if (downstream.isAlive()) throw new AssertionError("downstream cleanup failed");
    }
}
