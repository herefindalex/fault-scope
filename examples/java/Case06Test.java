final class Case06Test {
    public static void main(String[] args) throws Exception {
        Case06.Projection projection = new Case06.Projection();
        projection.put(new Case06.Snapshot("Product42", 43, 100));
        if (Case06.readCurrentProjection(projection, "Product42").snapshot.revision != 43)
            throw new AssertionError("ordinary read may return revision 43");
        if (Case06.sleepBeforeRead(projection, "Product42", 0).snapshot.revision != 43)
            throw new AssertionError("fixed sleep did not prove revision 44");
        if (!Case06.readAtLeastRevision(projection, "Product42", 44).status.equals("NOT_FRESH_ENOUGH"))
            throw new AssertionError("43 cannot satisfy minimum 44");
        if (Case06.readAtLeastRevision(projection, "Product42", 0).snapshot.revision != 43)
            throw new AssertionError("eventual read may return 43");
        projection.put(new Case06.Snapshot("Product42", 44, 120));
        if (Case06.readAtLeastRevision(projection, "Product42", 44).snapshot.revision != 44)
            throw new AssertionError("44 should satisfy minimum 44");
        projection.put(new Case06.Snapshot("Product42", 45, 125));
        if (Case06.readAtLeastRevision(projection, "Product42", 44).snapshot.price != 125)
            throw new AssertionError("45 should satisfy minimum 44");
        Case06.Projection cache = new Case06.Projection();
        cache.put(new Case06.Snapshot("Product42", 43, 100));
        if (!Case06.readAtLeastRevision(cache, "Product42", 44).status.equals("NOT_FRESH_ENOUGH"))
            throw new AssertionError("cache must enforce minimum 44 too");
    }
}
