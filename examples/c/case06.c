#include <stdatomic.h>
#include <string.h>
#include <threads.h>
#include <time.h>

typedef struct { char product[32]; int revision; int price; } Case06Snapshot;
typedef struct { Case06Snapshot snapshot; int present; } Case06Projection;
typedef enum { CASE06_OK, CASE06_NOT_FOUND, CASE06_NOT_FRESH_ENOUGH } Case06Status;
typedef struct { Case06Status status; Case06Snapshot snapshot; } Case06Read;

static atomic_flag case06_projection_lock = ATOMIC_FLAG_INIT;
static void case06_lock(void) {
    while (atomic_flag_test_and_set_explicit(&case06_projection_lock, memory_order_acquire)) {}
}
static void case06_unlock(void) {
    atomic_flag_clear_explicit(&case06_projection_lock, memory_order_release);
}
static void case06_put(Case06Projection *projection, Case06Snapshot snapshot) {
    case06_lock();
    projection->snapshot = snapshot;
    projection->present = 1;
    case06_unlock();
}

// faultscope:begin fs-c06.read-current-projection
Case06Read case06_read_current_projection(Case06Projection *projection, const char *product) {
    case06_lock();
    Case06Read result = {0};
    result.status = projection->present && strcmp(projection->snapshot.product, product) == 0
        ? CASE06_OK : CASE06_NOT_FOUND;
    if (result.status == CASE06_OK) result.snapshot = projection->snapshot;
    case06_unlock();
    return result; /* May be revision 43. */
}
// faultscope:end fs-c06.read-current-projection

// faultscope:begin fs-c06.sleep-before-read
Case06Read case06_sleep_before_read(Case06Projection *projection, const char *product,
                                   long delay_millis) {
    struct timespec delay = {delay_millis / 1000, (delay_millis % 1000) * 1000000L};
    thrd_sleep(&delay, NULL); /* No propagation bound means no freshness proof. */
    return case06_read_current_projection(projection, product);
}
// faultscope:end fs-c06.sleep-before-read

// faultscope:begin fs-c06.reject-insufficient-revision
int case06_reject_insufficient_revision(Case06Snapshot snapshot, int minimum) {
    return snapshot.revision < minimum;
}
// faultscope:end fs-c06.reject-insufficient-revision

// faultscope:begin fs-c06.serve-fresh-enough-projection
Case06Read case06_serve_fresh_enough_projection(Case06Snapshot snapshot, int minimum) {
    if (case06_reject_insufficient_revision(snapshot, minimum)) {
        return (Case06Read){.status = CASE06_NOT_FRESH_ENOUGH};
    }
    return (Case06Read){.status = CASE06_OK, .snapshot = snapshot}; /* 45 satisfies 44. */
}
// faultscope:end fs-c06.serve-fresh-enough-projection

// faultscope:begin fs-c06.read-at-least-revision
Case06Read case06_read_at_least_revision(Case06Projection *projection, const char *product,
                                        int minimum) {
    Case06Read current = case06_read_current_projection(projection, product);
    if (current.status != CASE06_OK) return current;
    return case06_serve_fresh_enough_projection(current.snapshot, minimum);
}
// faultscope:end fs-c06.read-at-least-revision
