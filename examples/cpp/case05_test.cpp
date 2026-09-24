#include <cassert>
#include <thread>
#include "case05.cpp"

int main() {
    Case05Change e42{"Shipment42", 42, "PROCESSING"};
    Case05Change e43{"Shipment42", 43, "SHIPPED"};
    Case05Change e44{"Shipment42", 44, "DELIVERED"};
    Case05Projection weak;
    case05_apply_on_arrival(weak, e43);
    case05_apply_on_arrival(weak, e42);
    assert(weak.read("Shipment42").revision == 42);

    Case05Projection strong;
    assert(case05_apply_if_newer(strong, e43));
    assert(!case05_apply_if_newer(strong, e42));
    assert(strong.read("Shipment42").state == "SHIPPED");
    assert(!case05_apply_if_newer(strong, e43));
    assert(case05_apply_if_newer(strong, e44));
    assert(strong.read("Shipment42").revision == 44);
    assert(case05_apply_if_newer(strong, {"Shipment99", 100, "CREATED"}));
    assert(strong.read("Shipment42").revision == 44);

    Case05Projection concurrent;
    std::thread first([&] { case05_apply_if_newer(concurrent, e42); });
    std::thread second([&] { case05_apply_if_newer(concurrent, e43); });
    first.join();
    second.join();
    assert(concurrent.read("Shipment42").revision == 43);

    std::set<std::string> tags;
    case05_add_shipment_tag(tags, "fragile");
    case05_add_shipment_tag(tags, "priority");
    case05_add_shipment_tag(tags, "fragile");
    assert(tags.size() == 2);
}
