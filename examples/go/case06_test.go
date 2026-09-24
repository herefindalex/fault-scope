package examplesgo

import "testing"

func TestCase06MinimumRevisionRead(t *testing.T) {
	projection := NewProductProjection()
	projection.Put(ProductSnapshot{"Product42", 43, 100})
	if got := ReadCurrentProjection(projection, "Product42"); got.Status != "OK" || got.Snapshot.Revision != 43 {
		t.Fatalf("ordinary read should be able to return revision 43: %+v", got)
	}
	if got := SleepBeforeRead(projection, "Product42", 0); got.Snapshot.Revision != 43 {
		t.Fatal("fixed sleep did not establish revision 44")
	}
	if got := ReadAtLeastRevision(projection, "Product42", 44); got.Status != "NOT_FRESH_ENOUGH" {
		t.Fatalf("43 cannot satisfy minimum 44: %+v", got)
	}
	if got := ReadAtLeastRevision(projection, "Product42", 0); got.Status != "OK" || got.Snapshot.Revision != 43 {
		t.Fatal("eventual read with no minimum may return revision 43")
	}
	projection.Put(ProductSnapshot{"Product42", 44, 120})
	if got := ReadAtLeastRevision(projection, "Product42", 44); got.Status != "OK" || got.Snapshot.Revision != 44 {
		t.Fatal("revision 44 must satisfy minimum 44")
	}
	projection.Put(ProductSnapshot{"Product42", 45, 125})
	if got := ReadAtLeastRevision(projection, "Product42", 44); got.Status != "OK" || got.Snapshot.Price != 125 {
		t.Fatal("revision 45 must satisfy minimum 44 without exact-value polling")
	}
	cache := NewProductProjection()
	cache.Put(ProductSnapshot{"Product42", 43, 100})
	if got := ReadAtLeastRevision(cache, "Product42", 44); got.Status != "NOT_FRESH_ENOUGH" {
		t.Fatal("a stale cache must enforce the same minimum")
	}
}
