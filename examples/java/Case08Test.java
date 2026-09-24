import java.util.List;

public final class Case08Test {
    public static void main(String[] args) {
        Case08.Store weakStore = new Case08.Store();
        Case08.WeakProjection before = new Case08.WeakProjection(weakStore);
        if (!before.apply(new Case08.Record("SHIPPED", 44))
                || before.apply(new Case08.Record("PROCESSING", 42))) {
            throw new AssertionError("live guard must reject revision 42");
        }
        Case08.WeakProjection after = new Case08.WeakProjection(weakStore);
        if (!after.apply(new Case08.Record("PROCESSING", 42))
                || !weakStore.read().state.equals("PROCESSING")) {
            throw new AssertionError("restart loses the volatile guard");
        }

        Case08.Store strongStore = new Case08.Store();
        Case08.persistStateWithRevision(strongStore, new Case08.Record("SHIPPED", 44));
        Case08.StrongProjection recovered = Case08.StrongProjection.recover(strongStore);
        if (!recovered.ready || recovered.apply(new Case08.Record("PROCESSING", 42))
                || !strongStore.read().state.equals("SHIPPED")) {
            throw new AssertionError("recovered revision 44 must reject revision 42");
        }
        if (!recovered.apply(new Case08.Record("DELIVERED", 45))
                || strongStore.read().revision != 45) {
            throw new AssertionError("revision 45 must advance state and revision");
        }

        Case08.StrongProjection rebuilt = Case08.rebuildBeforeReady(List.of(
            new Case08.Record("PROCESSING", 42), new Case08.Record("SHIPPED", 44)));
        if (rebuilt.apply(new Case08.Record("PROCESSING", 42))) {
            throw new AssertionError("replay must rebuild guard before readiness");
        }
    }
}
