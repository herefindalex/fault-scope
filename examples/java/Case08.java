import java.util.List;

final class Case08 {
    static final class Record {
        final String state;
        final int revision;
        Record(String state, int revision) {
            this.state = state;
            this.revision = revision;
        }
    }

    static final class Store {
        Record record = new Record("", 0);
        synchronized Record read() { return record; }
        synchronized void write(Record next) { record = next; }
    }

    static final class WeakProjection {
        final Store store;
        int guard = 0; // Lost with the process.
        WeakProjection(Store store) { this.store = store; }

        // faultscope:begin fs-c08.memory-only-revision
        boolean apply(Record event) {
            if (event.revision <= guard) return false;
            store.write(new Record(event.state, store.read().revision)); // Save value only.
            guard = event.revision;
            return true;
        }
        // faultscope:end fs-c08.memory-only-revision
    }

    // faultscope:begin fs-c08.persist-state-with-revision
    static void persistStateWithRevision(Store store, Record next) {
        store.write(next); // One atomic durable record in this model.
    }
    // faultscope:end fs-c08.persist-state-with-revision

    static final class StrongProjection {
        final Store store;
        Record current = new Record("", 0);
        boolean ready;
        private StrongProjection(Store store) { this.store = store; }

        // faultscope:begin fs-c08.recover-state-with-revision
        static StrongProjection recover(Store store) {
            StrongProjection projection = new StrongProjection(store);
            projection.current = store.read(); // Restore value and revision together.
            projection.ready = true; // Only after recovery may events be applied.
            return projection;
        }
        // faultscope:end fs-c08.recover-state-with-revision

        // faultscope:begin fs-c08.reject-stale-after-restart
        boolean apply(Record event) {
            if (!ready || event.revision <= current.revision) return false;
            persistStateWithRevision(store, event);
            current = event;
            return true;
        }
        // faultscope:end fs-c08.reject-stale-after-restart
    }

    // faultscope:begin fs-c08.rebuild-before-ready
    static StrongProjection rebuildBeforeReady(List<Record> history) {
        Store store = new Store();
        for (Record event : history) { // Complete authoritative history; no external effects here.
            if (event.revision > store.read().revision) persistStateWithRevision(store, event);
        }
        return StrongProjection.recover(store); // Ready only after replay.
    }
    // faultscope:end fs-c08.rebuild-before-ready
}
