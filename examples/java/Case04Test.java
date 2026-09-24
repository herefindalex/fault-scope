import java.util.HashSet;
import java.util.Set;

final class Case04Test {
    private static void require(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    public static void main(String[] args) {
        var weak = new Case04.RewardStore();
        var weakAck = new Case04.DeliveryAck();
        Case04.weakEffectThenAck(weak, weakAck, "E", "User42", 100, true);
        require(!weakAck.accepted.contains("E"), "pre-ACK crash was acknowledged");
        Case04.weakEffectThenAck(weak, weakAck, "E", "User42", 100, false);
        require(weak.state.balance.get("User42") == 200, "weak D1+D2 did not repeat");

        var ackFirst = new Case04.RewardStore();
        var firstAck = new Case04.DeliveryAck();
        Case04.ackBeforeEffect(ackFirst, firstAck, "E", "User42", 100, true);
        require(firstAck.accepted.contains("E") && !ackFirst.state.balance.containsKey("User42"),
                "ACK-first did not expose lost effect");

        var strong = new Case04.RewardStore();
        require(Case04.applyEventOnce(strong, "E", "User42", 100), "new E suppressed");
        require(!Case04.applyEventOnce(strong, "E", "User42", 100), "D2(E) applied");
        var strongAck = new Case04.DeliveryAck();
        Case04.handleRewardDelivery(strong, strongAck, "E", "User42", 100);
        require(strong.state.balance.get("User42") == 100 && strongAck.accepted.contains("E"),
                "redelivery did not finish safely");

        var split = new Case04.RewardStore();
        Set<String> marker = new HashSet<>();
        Case04.splitRewardAndMarker(split, marker, "E", "User42", 100, true);
        Case04.splitRewardAndMarker(split, marker, "E", "User42", 100, false);
        require(split.state.balance.get("User42") == 200, "split marker did not repeat effect");
    }
}
