import java.util.HashSet;
import java.util.Set;

final class Case05Test {
    public static void main(String[] args) {
        Case05.Change e42 = new Case05.Change("Shipment42", 42, "PROCESSING");
        Case05.Change e43 = new Case05.Change("Shipment42", 43, "SHIPPED");
        Case05.Change e44 = new Case05.Change("Shipment42", 44, "DELIVERED");
        Case05.Projection weak = new Case05.Projection();
        Case05.applyOnArrival(weak, e43);
        Case05.applyOnArrival(weak, e42);
        if (weak.read("Shipment42") != e42) throw new AssertionError("weak projection did not regress");

        Case05.Projection strong = new Case05.Projection();
        if (!Case05.applyIfNewer(strong, e43) || Case05.applyIfNewer(strong, e42)) {
            throw new AssertionError("source revision guard failed");
        }
        if (strong.read("Shipment42") != e43 || Case05.applyIfNewer(strong, e43)) {
            throw new AssertionError("duplicate or stale arrival changed state");
        }
        if (!Case05.applyIfNewer(strong, e44) || strong.read("Shipment42") != e44) {
            throw new AssertionError("newer revision did not advance");
        }
        if (!Case05.applyIfNewer(strong, new Case05.Change("Shipment99", 100, "CREATED"))
                || strong.read("Shipment42") != e44) {
            throw new AssertionError("other entity changed Shipment42");
        }
        Set<String> tags = new HashSet<>();
        Case05.addShipmentTag(tags, "fragile");
        Case05.addShipmentTag(tags, "priority");
        Case05.addShipmentTag(tags, "fragile");
        if (tags.size() != 2) throw new AssertionError("set union should be order independent");
    }
}
