package examplesgo

import "testing"

func TestCase05AuthoritativeRevision(t *testing.T) {
	e42 := ShipmentChange{"Shipment42", 42, "PROCESSING"}
	e43 := ShipmentChange{"Shipment42", 43, "SHIPPED"}
	e44 := ShipmentChange{"Shipment42", 44, "DELIVERED"}

	weak := NewShipmentProjection()
	ApplyOnArrival(weak, e43)
	ApplyOnArrival(weak, e42)
	if got := weak.Read("Shipment42"); got != e42 {
		t.Fatalf("weak projection should regress to E42, got %+v", got)
	}

	strong := NewShipmentProjection()
	if !ApplyIfNewer(strong, e43) || ApplyIfNewer(strong, e42) {
		t.Fatal("source revisions should accept E43 and reject E42")
	}
	if got := strong.Read("Shipment42"); got != e43 {
		t.Fatalf("stale E42 changed the projection: %+v", got)
	}
	if ApplyIfNewer(strong, e43) || strong.Read("Shipment42") != e43 {
		t.Fatal("duplicate E43 should leave state unchanged")
	}
	if !ApplyIfNewer(strong, e44) || strong.Read("Shipment42") != e44 {
		t.Fatal("newer E44 should advance the projection")
	}
	other := ShipmentChange{"Shipment99", 100, "CREATED"}
	if !ApplyIfNewer(strong, other) || strong.Read("Shipment42") != e44 {
		t.Fatal("another entity must have independent revision state")
	}

	tags := map[string]bool{}
	AddShipmentTag(tags, "fragile")
	AddShipmentTag(tags, "priority")
	AddShipmentTag(tags, "fragile")
	if len(tags) != 2 {
		t.Fatal("set union should be order independent")
	}
}
