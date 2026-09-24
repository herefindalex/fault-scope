package examplesgo

import "context"

func case07ProcessBounded(item int) int { return item * 2 }

// faultscope:begin fs-c07.blocking-send-without-cancel
func BlockingSendWithoutCancel(out chan<- int, result int, entered chan<- struct{}) {
	close(entered)
	out <- result // With no receiver, cancellation cannot release this send.
}

// faultscope:end fs-c07.blocking-send-without-cancel

// faultscope:begin fs-c07.precheck-then-block
func PrecheckThenBlock(ctx context.Context, out chan<- int, item int, entered chan<- struct{}) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	result := case07ProcessBounded(item)
	BlockingSendWithoutCancel(out, result, entered)
	return nil
}

// faultscope:end fs-c07.precheck-then-block

// faultscope:begin fs-c07.blocking-send-with-cancel
func BlockingSendWithCancel(ctx context.Context, out chan<- int, result int, entered chan<- struct{}) error {
	close(entered)
	select {
	case out <- result:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// faultscope:end fs-c07.blocking-send-with-cancel

// faultscope:begin fs-c07.long-work-check-cancel
func LongWorkCheckCancel(ctx context.Context, units int) error {
	for i := 0; i < units; i++ {
		if i%1024 == 0 {
			if err := ctx.Err(); err != nil {
				return err
			}
		}
		_ = i * i // One bounded unit need not check after every instruction.
	}
	return nil
}

// faultscope:end fs-c07.long-work-check-cancel

// faultscope:begin fs-c07.downstream-without-cancellation
func DownstreamWithoutCancellation(release <-chan struct{}, entered chan<- struct{}) {
	close(entered)
	<-release // This API has no cancellation input.
}

// faultscope:end fs-c07.downstream-without-cancellation
