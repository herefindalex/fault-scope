package examplesgo

import (
	"maps"
	"sync"
)

// RewardStore represents the authoritative transaction boundary for this example.
// A production implementation would make the balance and processed ID durable together.
type RewardStore struct {
	mu    sync.Mutex
	State RewardState
}

type RewardState struct {
	Balance   map[string]int
	Processed map[string]bool
}

type DeliveryAck struct{ Accepted map[string]bool }

func NewRewardStore() *RewardStore {
	return &RewardStore{State: RewardState{Balance: map[string]int{}, Processed: map[string]bool{}}}
}

// faultscope:begin fs-c04.effect-then-ack
func WeakEffectThenAck(store *RewardStore, ack *DeliveryAck, eventID, userID string, points int, crashBeforeAck bool) {
	store.State.Balance[userID] += points // The protected effect commits first.
	if crashBeforeAck {
		return // The broker can redeliver this same logical event.
	}
	ack.Accepted[eventID] = true
}

// faultscope:end fs-c04.effect-then-ack

// faultscope:begin fs-c04.ack-before-effect
func AckBeforeEffect(store *RewardStore, ack *DeliveryAck, eventID, userID string, points int, crashAfterAck bool) {
	ack.Accepted[eventID] = true
	if crashAfterAck {
		return // No redelivery obligation, yet no reward was applied.
	}
	store.State.Balance[userID] += points
}

// faultscope:end fs-c04.ack-before-effect

// faultscope:begin fs-c04.apply-event-once
func (store *RewardStore) ApplyEventOnce(eventID, userID string, points int) bool {
	store.mu.Lock()
	defer store.mu.Unlock()
	if store.State.Processed[eventID] {
		return false
	}
	// Model a Rewards Store transaction with one authoritative commit point.
	next := RewardState{
		Balance:   maps.Clone(store.State.Balance),
		Processed: maps.Clone(store.State.Processed),
	}
	next.Processed[eventID] = true
	next.Balance[userID] += points
	store.State = next // The processed ID and protected effect become visible together.
	return true
}

// faultscope:end fs-c04.apply-event-once

// faultscope:begin fs-c04.redelivery-no-repeat
func HandleRewardDelivery(store *RewardStore, ack *DeliveryAck, eventID, userID string, points int) {
	store.ApplyEventOnce(eventID, userID, points)
	ack.Accepted[eventID] = true // A repeated delivery can also be ACKed.
}

// faultscope:end fs-c04.redelivery-no-repeat

// faultscope:begin fs-c04.separate-dedupe-record
func SplitRewardAndMarker(store *RewardStore, marker map[string]bool, eventID, userID string, points int, crashBeforeMarker bool) {
	if marker[eventID] {
		return
	}
	store.State.Balance[userID] += points // Reward commits in a different boundary.
	if crashBeforeMarker {
		return // The marker is absent, so redelivery can add again.
	}
	marker[eventID] = true
}

// faultscope:end fs-c04.separate-dedupe-record
