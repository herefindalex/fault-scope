#include <cassert>
#include "case06.cpp"

int main() {
    Case06Projection projection;
    projection.put({"Product42", 43, 100});
    assert(case06_read_current_projection(projection, "Product42").snapshot->revision == 43);
    assert(case06_sleep_before_read(projection, "Product42", std::chrono::milliseconds(0)).snapshot->revision == 43);
    assert(case06_read_at_least_revision(projection, "Product42", 44).status == "NOT_FRESH_ENOUGH");
    assert(case06_read_at_least_revision(projection, "Product42", 0).snapshot->revision == 43);
    projection.put({"Product42", 44, 120});
    assert(case06_read_at_least_revision(projection, "Product42", 44).snapshot->revision == 44);
    projection.put({"Product42", 45, 125});
    assert(case06_read_at_least_revision(projection, "Product42", 44).snapshot->price == 125);
    Case06Projection cache;
    cache.put({"Product42", 43, 100});
    assert(case06_read_at_least_revision(cache, "Product42", 44).status == "NOT_FRESH_ENOUGH");
}
