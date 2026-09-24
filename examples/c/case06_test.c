#include <assert.h>
#include "case06.c"

int main(void) {
    Case06Projection projection = {0};
    case06_put(&projection, (Case06Snapshot){"Product42", 43, 100});
    assert(case06_read_current_projection(&projection, "Product42").snapshot.revision == 43);
    assert(case06_sleep_before_read(&projection, "Product42", 0).snapshot.revision == 43);
    assert(case06_read_at_least_revision(&projection, "Product42", 44).status == CASE06_NOT_FRESH_ENOUGH);
    assert(case06_read_at_least_revision(&projection, "Product42", 0).snapshot.revision == 43);
    case06_put(&projection, (Case06Snapshot){"Product42", 44, 120});
    assert(case06_read_at_least_revision(&projection, "Product42", 44).snapshot.revision == 44);
    case06_put(&projection, (Case06Snapshot){"Product42", 45, 125});
    assert(case06_read_at_least_revision(&projection, "Product42", 44).snapshot.price == 125);
    Case06Projection cache = {0};
    case06_put(&cache, (Case06Snapshot){"Product42", 43, 100});
    assert(case06_read_at_least_revision(&cache, "Product42", 44).status == CASE06_NOT_FRESH_ENOUGH);
    return 0;
}
