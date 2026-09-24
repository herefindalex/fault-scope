import unittest

from case05 import (
    ShipmentChange,
    ShipmentProjection,
    add_shipment_tag,
    apply_if_newer,
    apply_on_arrival,
)


class Case05Test(unittest.TestCase):
    def test_authoritative_revision(self):
        e42 = ShipmentChange("Shipment42", 42, "PROCESSING")
        e43 = ShipmentChange("Shipment42", 43, "SHIPPED")
        e44 = ShipmentChange("Shipment42", 44, "DELIVERED")
        weak = ShipmentProjection()
        apply_on_arrival(weak, e43)
        apply_on_arrival(weak, e42)
        self.assertEqual(weak.read("Shipment42"), e42)

        strong = ShipmentProjection()
        self.assertTrue(apply_if_newer(strong, e43))
        self.assertFalse(apply_if_newer(strong, e42))
        self.assertEqual(strong.read("Shipment42"), e43)
        self.assertFalse(apply_if_newer(strong, e43))
        self.assertTrue(apply_if_newer(strong, e44))
        self.assertEqual(strong.read("Shipment42"), e44)
        self.assertTrue(apply_if_newer(strong, ShipmentChange("Shipment99", 100, "CREATED")))
        self.assertEqual(strong.read("Shipment42"), e44)

        tags = set()
        for tag in ("fragile", "priority", "fragile"):
            add_shipment_tag(tags, tag)
        self.assertEqual(len(tags), 2)


if __name__ == "__main__":
    unittest.main()
