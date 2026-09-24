import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

final class Case04 {
    static final class RewardState {
        final Map<String, Integer> balance;
        final Set<String> processed;

        RewardState() {
            balance = new HashMap<>();
            processed = new HashSet<>();
        }

        RewardState(RewardState prior) {
            balance = new HashMap<>(prior.balance);
            processed = new HashSet<>(prior.processed);
        }
    }

    static final class RewardStore {
        RewardState state = new RewardState();

        void add(String userId, int points) {
            state.balance.merge(userId, points, Integer::sum);
        }
    }

    static final class DeliveryAck {
        final Set<String> accepted = new HashSet<>();
    }

    // faultscope:begin fs-c04.effect-then-ack
    static void weakEffectThenAck(RewardStore store, DeliveryAck ack, String eventId,
                                  String userId, int points, boolean crashBeforeAck) {
        store.add(userId, points); // Protected effect commits first.
        if (crashBeforeAck) return; // Broker may redeliver E.
        ack.accepted.add(eventId);
    }
    // faultscope:end fs-c04.effect-then-ack

    // faultscope:begin fs-c04.ack-before-effect
    static void ackBeforeEffect(RewardStore store, DeliveryAck ack, String eventId,
                                String userId, int points, boolean crashAfterAck) {
        ack.accepted.add(eventId);
        if (crashAfterAck) return; // ACK survives; reward may be lost.
        store.add(userId, points);
    }
    // faultscope:end fs-c04.ack-before-effect

    // faultscope:begin fs-c04.apply-event-once
    static boolean applyEventOnce(RewardStore store, String eventId,
                                  String userId, int points) {
        synchronized (store) {
            if (store.state.processed.contains(eventId)) return false;
            // Model one Rewards Store transaction with a single commit point.
            RewardState next = new RewardState(store.state);
            next.processed.add(eventId);
            next.balance.merge(userId, points, Integer::sum);
            store.state = next; // Identity and effect become visible together.
            return true;
        }
    }
    // faultscope:end fs-c04.apply-event-once

    // faultscope:begin fs-c04.redelivery-no-repeat
    static void handleRewardDelivery(RewardStore store, DeliveryAck ack,
                                     String eventId, String userId, int points) {
        applyEventOnce(store, eventId, userId, points);
        ack.accepted.add(eventId); // D2(E) can finish without another +100.
    }
    // faultscope:end fs-c04.redelivery-no-repeat

    // faultscope:begin fs-c04.separate-dedupe-record
    static void splitRewardAndMarker(RewardStore store, Set<String> marker,
                                     String eventId, String userId, int points,
                                     boolean crashBeforeMarker) {
        if (marker.contains(eventId)) return;
        store.add(userId, points); // Separate reward durability boundary.
        if (crashBeforeMarker) return;
        marker.add(eventId);
    }
    // faultscope:end fs-c04.separate-dedupe-record
}
