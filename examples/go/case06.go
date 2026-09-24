package examplesgo

import (
	"sync"
	"time"
)

type ProductSnapshot struct {
	Product  string
	Revision int
	Price    int
}

type ProductProjection struct {
	mu      sync.Mutex
	records map[string]ProductSnapshot
}

func NewProductProjection() *ProductProjection {
	return &ProductProjection{records: make(map[string]ProductSnapshot)}
}

func (p *ProductProjection) Put(snapshot ProductSnapshot) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.records[snapshot.Product] = snapshot
}

type FreshRead struct {
	Status   string
	Snapshot ProductSnapshot
}

// faultscope:begin fs-c06.read-current-projection
func ReadCurrentProjection(p *ProductProjection, product string) FreshRead {
	p.mu.Lock()
	defer p.mu.Unlock()
	snapshot, ok := p.records[product]
	if !ok {
		return FreshRead{Status: "NOT_FOUND"}
	}
	return FreshRead{Status: "OK", Snapshot: snapshot} // May be revision 43.
}

// faultscope:end fs-c06.read-current-projection

// faultscope:begin fs-c06.sleep-before-read
func SleepBeforeRead(p *ProductProjection, product string, delay time.Duration) FreshRead {
	time.Sleep(delay) // No propagation bound means no freshness proof.
	return ReadCurrentProjection(p, product)
}

// faultscope:end fs-c06.sleep-before-read

// faultscope:begin fs-c06.reject-insufficient-revision
func RejectInsufficientRevision(snapshot ProductSnapshot, minimum int) bool {
	return snapshot.Revision < minimum
}

// faultscope:end fs-c06.reject-insufficient-revision

// faultscope:begin fs-c06.serve-fresh-enough-projection
func ServeFreshEnoughProjection(snapshot ProductSnapshot, minimum int) FreshRead {
	if RejectInsufficientRevision(snapshot, minimum) {
		return FreshRead{Status: "NOT_FRESH_ENOUGH"}
	}
	return FreshRead{Status: "OK", Snapshot: snapshot} // 44 or 45 satisfies 44.
}

// faultscope:end fs-c06.serve-fresh-enough-projection

// faultscope:begin fs-c06.read-at-least-revision
func ReadAtLeastRevision(p *ProductProjection, product string, minimum int) FreshRead {
	current := ReadCurrentProjection(p, product)
	if current.Status != "OK" {
		return current
	}
	return ServeFreshEnoughProjection(current.Snapshot, minimum)
}

// faultscope:end fs-c06.read-at-least-revision
