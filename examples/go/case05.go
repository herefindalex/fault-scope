package examplesgo

import "sync"

// ShipmentChange has ordering meaning only within one source-owned shipment stream.
type ShipmentChange struct {
	Shipment string
	Revision int
	State    string
}

type ShipmentProjection struct {
	mu      sync.Mutex
	records map[string]ShipmentChange
}

func NewShipmentProjection() *ShipmentProjection {
	return &ShipmentProjection{records: make(map[string]ShipmentChange)}
}

func (p *ShipmentProjection) Read(shipment string) ShipmentChange {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.records[shipment]
}

// faultscope:begin fs-c05.apply-on-arrival
func ApplyOnArrival(p *ShipmentProjection, incoming ShipmentChange) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.records[incoming.Shipment] = incoming // E42 can overwrite E43.
}

// faultscope:end fs-c05.apply-on-arrival

// faultscope:begin fs-c05.reject-stale-revision
func RejectStaleRevision(applied, incoming int) bool {
	return incoming <= applied // Equal revision is a duplicate.
}

// faultscope:end fs-c05.reject-stale-revision

// faultscope:begin fs-c05.accept-newer-revision
func AcceptNewerRevision(p *ShipmentProjection, incoming ShipmentChange) {
	p.records[incoming.Shipment] = incoming // State and revision change together.
}

// faultscope:end fs-c05.accept-newer-revision

// faultscope:begin fs-c05.apply-if-newer
func ApplyIfNewer(p *ShipmentProjection, incoming ShipmentChange) bool {
	p.mu.Lock() // Models one atomic projection mutation per entity.
	defer p.mu.Unlock()
	current := p.records[incoming.Shipment]
	if RejectStaleRevision(current.Revision, incoming.Revision) {
		return false
	}
	AcceptNewerRevision(p, incoming)
	return true
}

// faultscope:end fs-c05.apply-if-newer

// Set union is a negative control: order cannot change the final tag set.
func AddShipmentTag(tags map[string]bool, tag string) { tags[tag] = true }
