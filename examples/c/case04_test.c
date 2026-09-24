#include <assert.h>
#include <threads.h>
#include "case04.c"

typedef struct { Case04RewardStore *store; int result; } Case04ConcurrentDelivery;

static int case04_concurrent_apply(void *arg) {
  Case04ConcurrentDelivery *delivery = arg;
  delivery->result = case04_apply_event_once(delivery->store, "E-concurrent", 100);
  return 0;
}

int main(void) {
    Case04RewardStore weak = {0};
    Case04DeliveryAck weak_ack = {0};
    case04_weak_effect_then_ack(&weak, &weak_ack, 100, 1);
    assert(!weak_ack.accepted);
    case04_weak_effect_then_ack(&weak, &weak_ack, 100, 0);
    assert(weak.user42_balance == 200);

    Case04RewardStore ack_first = {0};
    Case04DeliveryAck first_ack = {0};
    case04_ack_before_effect(&ack_first, &first_ack, 100, 1);
    assert(first_ack.accepted && ack_first.user42_balance == 0);

    Case04RewardStore strong = {0};
    assert(case04_apply_event_once(&strong, "E", 100) == 1);
    assert(case04_apply_event_once(&strong, "E", 100) == 0);
    assert(strong.user42_balance == 100);
    Case04DeliveryAck strong_ack = {0};
    assert(case04_handle_reward_delivery(&strong, &strong_ack, "E", 100) == 0);
  assert(strong_ack.accepted && strong.user42_balance == 100);

  Case04RewardStore concurrent = {0};
  Case04ConcurrentDelivery deliveries[8];
  thrd_t threads[8];
  for (size_t i = 0; i < 8; i++) {
    deliveries[i] = (Case04ConcurrentDelivery){.store = &concurrent};
    assert(thrd_create(&threads[i], case04_concurrent_apply, &deliveries[i]) == thrd_success);
  }
  int applied = 0;
  for (size_t i = 0; i < 8; i++) {
    assert(thrd_join(threads[i], NULL) == thrd_success);
    applied += deliveries[i].result;
  }
  assert(applied == 1 && concurrent.user42_balance == 100);

    Case04RewardStore split = {0};
    Case04Marker marker = {0};
    case04_split_reward_and_marker(&split, &marker, "E", 100, 1);
    case04_split_reward_and_marker(&split, &marker, "E", 100, 0);
    assert(split.user42_balance == 200);
    return 0;
}
