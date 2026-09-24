import java.util.HashMap;
import java.util.Map;
import java.util.Set;

final class Case05 {
    static final class Change {
        final String shipment;
        final int revision;
        final String state;

        Change(String shipment, int revision, String state) {
            this.shipment = shipment;
            this.revision = revision;
            this.state = state;
        }
    }

    static final class Projection {
        final Map<String, Change> records = new HashMap<>();

        synchronized Change read(String shipment) { return records.get(shipment); }
    }

    // faultscope:begin fs-c05.apply-on-arrival
    static void applyOnArrival(Projection projection, Change incoming) {
        synchronized (projection) {
            projection.records.put(incoming.shipment, incoming); // E42 can overwrite E43.
        }
    }
    // faultscope:end fs-c05.apply-on-arrival

    // faultscope:begin fs-c05.reject-stale-revision
    static boolean rejectStaleRevision(int applied, int incoming) {
        return incoming <= applied; // Equal revision is a duplicate.
    }
    // faultscope:end fs-c05.reject-stale-revision

    // faultscope:begin fs-c05.accept-newer-revision
    static void acceptNewerRevision(Projection projection, Change incoming) {
        projection.records.put(incoming.shipment, incoming); // State and revision together.
    }
    // faultscope:end fs-c05.accept-newer-revision

    // faultscope:begin fs-c05.apply-if-newer
    static boolean applyIfNewer(Projection projection, Change incoming) {
        synchronized (projection) { // Models one atomic projection mutation.
            Change current = projection.records.get(incoming.shipment);
            if (current != null && rejectStaleRevision(current.revision, incoming.revision)) {
                return false;
            }
            acceptNewerRevision(projection, incoming);
            return true;
        }
    }
    // faultscope:end fs-c05.apply-if-newer

    static void addShipmentTag(Set<String> tags, String tag) { tags.add(tag); }
}
