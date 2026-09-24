#include <assert.h>
#include <threads.h>
#include "case05.c"

typedef struct { Case05Projection *projection; Case05Change change; } Case05Delivery;

static int case05_concurrent_apply(void *arg) {
    Case05Delivery *delivery = arg;
    return case05_apply_if_newer(delivery->projection, delivery->change) < 0;
}

int main(void) {
    Case05Change e42 = {"Shipment42", 42, "PROCESSING"};
    Case05Change e43 = {"Shipment42", 43, "SHIPPED"};
    Case05Change e44 = {"Shipment42", 44, "DELIVERED"};
    Case05Projection weak = {0};
    assert(case05_apply_on_arrival(&weak, e43) == 1);
    assert(case05_apply_on_arrival(&weak, e42) == 1);
    assert(case05_find(&weak, "Shipment42")->revision == 42);

    Case05Projection strong = {0};
    assert(case05_apply_if_newer(&strong, e43) == 1);
    assert(case05_apply_if_newer(&strong, e42) == 0);
    assert(strcmp(case05_find(&strong, "Shipment42")->state, "SHIPPED") == 0);
    assert(case05_apply_if_newer(&strong, e43) == 0);
    assert(case05_apply_if_newer(&strong, e44) == 1);
    assert(case05_find(&strong, "Shipment42")->revision == 44);
    assert(case05_apply_if_newer(&strong, (Case05Change){"Shipment99", 100, "CREATED"}) == 1);
    assert(case05_find(&strong, "Shipment42")->revision == 44);

    Case05Projection concurrent = {0};
    Case05Delivery deliveries[] = {{&concurrent, e42}, {&concurrent, e43}};
    thrd_t threads[2];
    for (size_t i = 0; i < 2; i++) {
        assert(thrd_create(&threads[i], case05_concurrent_apply, &deliveries[i]) == thrd_success);
    }
    for (size_t i = 0; i < 2; i++) assert(thrd_join(threads[i], NULL) == thrd_success);
    assert(case05_find(&concurrent, "Shipment42")->revision == 43);

    unsigned tags = 0;
    case05_add_tag(&tags, 1u);
    case05_add_tag(&tags, 2u);
    case05_add_tag(&tags, 1u);
    assert(tags == 3u);
    return 0;
}
