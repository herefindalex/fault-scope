#include <stdatomic.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>

typedef struct {
    char shipment[32];
    int revision;
    char state[32];
} Case05Change;

typedef struct {
    Case05Change records[4];
    size_t count;
} Case05Projection;

/* One lock models a projection transaction across concurrent deliveries. */
static atomic_flag case05_projection_lock = ATOMIC_FLAG_INIT;

static void case05_lock(void) {
    while (atomic_flag_test_and_set_explicit(&case05_projection_lock, memory_order_acquire)) {}
}

static void case05_unlock(void) {
    atomic_flag_clear_explicit(&case05_projection_lock, memory_order_release);
}

static Case05Change *case05_find(Case05Projection *projection, const char *shipment) {
    for (size_t i = 0; i < projection->count; i++) {
        if (strcmp(projection->records[i].shipment, shipment) == 0) return &projection->records[i];
    }
    return NULL;
}

// faultscope:begin fs-c05.apply-on-arrival
int case05_apply_on_arrival(Case05Projection *projection, Case05Change incoming) {
    case05_lock();
    Case05Change *current = case05_find(projection, incoming.shipment);
    if (current) *current = incoming; /* E42 can overwrite E43. */
    else if (projection->count < 4) projection->records[projection->count++] = incoming;
    else { case05_unlock(); return -1; }
    case05_unlock();
    return 1;
}
// faultscope:end fs-c05.apply-on-arrival

// faultscope:begin fs-c05.reject-stale-revision
int case05_reject_stale_revision(int applied, int incoming) {
    return incoming <= applied; /* Equal revision is a duplicate. */
}
// faultscope:end fs-c05.reject-stale-revision

// faultscope:begin fs-c05.accept-newer-revision
void case05_accept_newer_revision(Case05Projection *projection, Case05Change incoming,
                                  Case05Change *current) {
    if (current) *current = incoming;
    else projection->records[projection->count++] = incoming;
    /* State and revision change together under the projection lock. */
}
// faultscope:end fs-c05.accept-newer-revision

// faultscope:begin fs-c05.apply-if-newer
int case05_apply_if_newer(Case05Projection *projection, Case05Change incoming) {
    case05_lock();
    Case05Change *current = case05_find(projection, incoming.shipment);
    if (current && case05_reject_stale_revision(current->revision, incoming.revision)) {
        case05_unlock();
        return 0;
    }
    if (!current && projection->count == 4) { case05_unlock(); return -1; }
    case05_accept_newer_revision(projection, incoming, current);
    case05_unlock();
    return 1;
}
// faultscope:end fs-c05.apply-if-newer

static void case05_add_tag(unsigned *bits, unsigned tag_bit) { *bits |= tag_bit; }
