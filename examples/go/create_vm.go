package examplesgo

import (
	"context"
	"errors"
)

var ErrDeadline = errors.New("no completion response before deadline")
var ErrUnresolved = errors.New("logical operation unresolved")

type VM struct{ Size string }
type Client interface {
	CreateVM(context.Context, string, VM) error
}

// The blank identity models a receiver with no documented repeat protection.
// faultscope:begin fs-c01.retry-independent-attempt
func RetryIndependent(ctx context.Context, client Client, spec VM) error {
	err := client.CreateVM(ctx, "", spec)
	if errors.Is(err, ErrDeadline) {
		return client.CreateVM(ctx, "", spec)
	}
	return err
}

// faultscope:end fs-c01.retry-independent-attempt

// faultscope:begin fs-c01.keep-unresolved
func KeepUnresolved(err error) error {
	if errors.Is(err, ErrDeadline) {
		return ErrUnresolved // No response does not establish no VM.
	}
	return err
}

// faultscope:end fs-c01.keep-unresolved

// The stronger synthetic receiver contract binds compatible repeats to P.
// faultscope:begin fs-c01.retry-same-logical-operation
func RetrySameOperation(ctx context.Context, client Client, spec VM, p string) error {
	err := client.CreateVM(ctx, p, spec)
	if errors.Is(err, ErrDeadline) {
		return client.CreateVM(ctx, p, spec)
	}
	return err
}

// faultscope:end fs-c01.retry-same-logical-operation

// faultscope:begin fs-c01.retry-with-new-logical-operation
func RetryWithNewOperation(ctx context.Context, client Client, spec VM, p, q string) error {
	err := client.CreateVM(ctx, p, spec)
	if errors.Is(err, ErrDeadline) {
		return client.CreateVM(ctx, q, spec) // Q is another logical operation.
	}
	return err
}

// faultscope:end fs-c01.retry-with-new-logical-operation
