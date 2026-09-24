package examplesgo

import "testing"

func TestCase04DeliveryAndProtectedEffect(t *testing.T) {
	weak, weakAck := NewRewardStore(), &DeliveryAck{Accepted: map[string]bool{}}
	WeakEffectThenAck(weak, weakAck, "E", "User42", 100, true)
	if weakAck.Accepted["E"] {
		t.Fatal("the pre-ACK crash was acknowledged")
	}
	WeakEffectThenAck(weak, weakAck, "E", "User42", 100, false)
	if weak.State.Balance["User42"] != 200 {
		t.Fatal("the weak D1+D2 trace did not repeat the reward")
	}

	ackFirst, firstAck := NewRewardStore(), &DeliveryAck{Accepted: map[string]bool{}}
	AckBeforeEffect(ackFirst, firstAck, "E", "User42", 100, true)
	if !firstAck.Accepted["E"] || ackFirst.State.Balance["User42"] != 0 {
		t.Fatal("ACK-first did not expose the lost-effect gap")
	}

	strong, strongAck := NewRewardStore(), &DeliveryAck{Accepted: map[string]bool{}}
	if !strong.ApplyEventOnce("E", "User42", 100) {
		t.Fatal("first-time E was suppressed")
	}
	if strong.ApplyEventOnce("E", "User42", 100) || strong.State.Balance["User42"] != 100 {
		t.Fatal("D2(E) repeated the protected reward")
	}
	HandleRewardDelivery(strong, strongAck, "E", "User42", 100)
	if !strongAck.Accepted["E"] || strong.State.Balance["User42"] != 100 {
		t.Fatal("redelivery could not finish safely")
	}

	split, marker := NewRewardStore(), map[string]bool{}
	SplitRewardAndMarker(split, marker, "E", "User42", 100, true)
	SplitRewardAndMarker(split, marker, "E", "User42", 100, false)
	if split.State.Balance["User42"] != 200 {
		t.Fatal("split marker did not expose the repeated effect")
	}
}
