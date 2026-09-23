import java.util.ArrayList;
import java.util.List;

final class Case03Test {
    public static void main(String[] args) {
        Case03.OrderDb weak = new Case03.OrderDb();
        Case03.commitBusinessStateOnly(weak); // Process stops before publish is invoked.
        if (!weak.confirmed || weak.outboxPending) throw new AssertionError("weak gap missing");
        Case03.OrderDb rolledBack = new Case03.OrderDb();
        try {
            Case03.confirmWithOutbox(rolledBack, true);
            throw new AssertionError("expected rollback");
        } catch (IllegalStateException expected) {
            if (rolledBack.confirmed || rolledBack.outboxPending) throw new AssertionError("partial commit");
        }
        Case03.OrderDb repaired = new Case03.OrderDb();
        Case03.confirmWithOutbox(repaired, false);
        if (!repaired.confirmed || !repaired.outboxPending) throw new AssertionError("intent missing");
        List<String> events = new ArrayList<>();
        Case03.relayPublishPending(repaired, events::add);
        Case03.relayPublishPending(repaired, events::add); // Crash before marking SENT.
        if (events.size() != 2) throw new AssertionError("duplicate boundary missing");
        Case03.markPublicationComplete(repaired);
        Case03.relayPublishPending(repaired, events::add);
        if (events.size() != 2) throw new AssertionError("published after sent");
    }
}
