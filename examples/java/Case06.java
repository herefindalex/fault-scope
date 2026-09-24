import java.util.HashMap;
import java.util.Map;

final class Case06 {
    static final class Snapshot {
        final String product;
        final int revision;
        final int price;
        Snapshot(String product, int revision, int price) {
            this.product = product;
            this.revision = revision;
            this.price = price;
        }
    }

    static final class Projection {
        private final Map<String, Snapshot> records = new HashMap<>();
        synchronized void put(Snapshot snapshot) { records.put(snapshot.product, snapshot); }
        synchronized Snapshot read(String product) { return records.get(product); }
    }

    static final class Read {
        final String status;
        final Snapshot snapshot;
        Read(String status, Snapshot snapshot) {
            this.status = status;
            this.snapshot = snapshot;
        }
    }

    // faultscope:begin fs-c06.read-current-projection
    static Read readCurrentProjection(Projection projection, String product) {
        Snapshot snapshot = projection.read(product);
        return snapshot == null ? new Read("NOT_FOUND", null) : new Read("OK", snapshot);
    }
    // faultscope:end fs-c06.read-current-projection

    // faultscope:begin fs-c06.sleep-before-read
    static Read sleepBeforeRead(Projection projection, String product, long delayMillis)
            throws InterruptedException {
        Thread.sleep(delayMillis); // No propagation bound means no freshness proof.
        return readCurrentProjection(projection, product);
    }
    // faultscope:end fs-c06.sleep-before-read

    // faultscope:begin fs-c06.reject-insufficient-revision
    static boolean rejectInsufficientRevision(Snapshot snapshot, int minimum) {
        return snapshot.revision < minimum;
    }
    // faultscope:end fs-c06.reject-insufficient-revision

    // faultscope:begin fs-c06.serve-fresh-enough-projection
    static Read serveFreshEnoughProjection(Snapshot snapshot, int minimum) {
        if (rejectInsufficientRevision(snapshot, minimum)) return new Read("NOT_FRESH_ENOUGH", null);
        return new Read("OK", snapshot); // Revision 44 or 45 satisfies minimum 44.
    }
    // faultscope:end fs-c06.serve-fresh-enough-projection

    // faultscope:begin fs-c06.read-at-least-revision
    static Read readAtLeastRevision(Projection projection, String product, int minimum) {
        Read current = readCurrentProjection(projection, product);
        if (!current.status.equals("OK")) return current;
        return serveFreshEnoughProjection(current.snapshot, minimum);
    }
    // faultscope:end fs-c06.read-at-least-revision
}
