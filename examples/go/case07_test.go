package examplesgo

import (
	"context"
	"testing"
	"time"
)

func case07Await(t *testing.T, done <-chan error) error {
	t.Helper()
	select {
	case err := <-done:
		return err
	case <-time.After(time.Second):
		t.Fatal("worker failed to terminate")
		return nil
	}
}

func TestCase07CancellationAtBlockingHandoff(t *testing.T) {
	weakCtx, weakCancel := context.WithCancel(context.Background())
	weakOut, weakEntered, weakDone := make(chan int), make(chan struct{}), make(chan error, 1)
	go func() { weakDone <- PrecheckThenBlock(weakCtx, weakOut, 21, weakEntered) }()
	<-weakEntered
	weakCancel()
	select {
	case <-weakDone:
		t.Fatal("weak send should remain blocked without a receiver")
	case <-time.After(10 * time.Millisecond):
	}
	if got := <-weakOut; got != 42 {
		t.Fatalf("cleanup receiver got %d", got)
	}
	if err := case07Await(t, weakDone); err != nil {
		t.Fatal(err)
	}

	strongCtx, strongCancel := context.WithCancel(context.Background())
	strongOut, strongEntered, strongDone := make(chan int), make(chan struct{}), make(chan error, 1)
	go func() { strongDone <- BlockingSendWithCancel(strongCtx, strongOut, 42, strongEntered) }()
	<-strongEntered
	strongCancel()
	if err := case07Await(t, strongDone); err != context.Canceled {
		t.Fatalf("want cancellation, got %v", err)
	}

	readyCtx, readyCancel := context.WithCancel(context.Background())
	readyOut, readyEntered, readyDone := make(chan int, 1), make(chan struct{}), make(chan error, 1)
	go func() { readyDone <- BlockingSendWithCancel(readyCtx, readyOut, 42, readyEntered) }()
	<-readyEntered
	if err := case07Await(t, readyDone); err != nil {
		t.Fatal(err)
	}
	readyCancel() // Late cancellation does not retract a completed result.
	if got := <-readyOut; got != 42 {
		t.Fatalf("late cancel changed delivered result: %d", got)
	}

	if err := LongWorkCheckCancel(strongCtx, 100000); err != context.Canceled {
		t.Fatal("long work ignored cancellation")
	}
	release, entered, downstreamDone := make(chan struct{}), make(chan struct{}), make(chan struct{})
	go func() { DownstreamWithoutCancellation(release, entered); close(downstreamDone) }()
	<-entered
	select {
	case <-downstreamDone:
		t.Fatal("downstream should not finish without release")
	default:
	}
	close(release)
	select {
	case <-downstreamDone:
	case <-time.After(time.Second):
		t.Fatal("downstream cleanup failed")
	}
}
