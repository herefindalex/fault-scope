#include <stddef.h>
#include <stdio.h>
#include <stdatomic.h>
#include <string.h>

typedef struct {
    int user42_balance;
    char processed_ids[8][32];
    size_t processed_count;
} Case04RewardStore;

typedef struct { int accepted; } Case04DeliveryAck;
typedef struct { int present; char event_id[32]; } Case04Marker;

static int case04_has_event(const Case04RewardStore *store, const char *event_id) {
    for (size_t i = 0; i < store->processed_count; i++) {
        if (strcmp(store->processed_ids[i], event_id) == 0) return 1;
    }
    return 0;
}

/* Serialize the model's one Rewards Store transaction across deliveries. */
static atomic_flag case04_store_lock = ATOMIC_FLAG_INIT;

static void case04_lock_store(void) {
  while (atomic_flag_test_and_set_explicit(&case04_store_lock, memory_order_acquire)) {}
}

static void case04_unlock_store(void) {
  atomic_flag_clear_explicit(&case04_store_lock, memory_order_release);
}

// faultscope:begin fs-c04.effect-then-ack
void case04_weak_effect_then_ack(Case04RewardStore *store, Case04DeliveryAck *ack,
                                 int points, int crash_before_ack) {
    store->user42_balance += points; /* Protected effect commits first. */
    if (crash_before_ack) return; /* Broker may redeliver E. */
    ack->accepted = 1;
}
// faultscope:end fs-c04.effect-then-ack

// faultscope:begin fs-c04.ack-before-effect
void case04_ack_before_effect(Case04RewardStore *store, Case04DeliveryAck *ack,
                              int points, int crash_after_ack) {
    ack->accepted = 1;
    if (crash_after_ack) return; /* ACK survives; reward may be lost. */
    store->user42_balance += points;
}
// faultscope:end fs-c04.ack-before-effect

// faultscope:begin fs-c04.apply-event-once
int case04_apply_event_once(Case04RewardStore *store, const char *event_id,
                            int points) {
  case04_lock_store();
  if (case04_has_event(store, event_id)) {
    case04_unlock_store();
    return 0;
  }
  if (strlen(event_id) >= sizeof(store->processed_ids[0]) ||
      store->processed_count == 8) {
    case04_unlock_store();
    return -1;
  }
    /* Model one Rewards Store transaction with a single commit point. */
    Case04RewardStore next = *store;
    snprintf(next.processed_ids[next.processed_count++], 32, "%s", event_id);
    next.user42_balance += points;
  *store = next; /* Identity and effect become visible together. */
  case04_unlock_store();
    return 1;
}
// faultscope:end fs-c04.apply-event-once

// faultscope:begin fs-c04.redelivery-no-repeat
int case04_handle_reward_delivery(Case04RewardStore *store, Case04DeliveryAck *ack,
                                   const char *event_id, int points) {
    int result = case04_apply_event_once(store, event_id, points);
    if (result < 0) return result;
    ack->accepted = 1; /* D2(E) can finish without another +100. */
    return result;
}
// faultscope:end fs-c04.redelivery-no-repeat

// faultscope:begin fs-c04.separate-dedupe-record
void case04_split_reward_and_marker(Case04RewardStore *store, Case04Marker *marker,
                                     const char *event_id, int points,
                                     int crash_before_marker) {
    if (marker->present && strcmp(marker->event_id, event_id) == 0) return;
    store->user42_balance += points; /* Separate reward durability boundary. */
    if (crash_before_marker) return;
    snprintf(marker->event_id, sizeof(marker->event_id), "%s", event_id);
    marker->present = 1;
}
// faultscope:end fs-c04.separate-dedupe-record
