import unittest

from case06 import (
    ProductProjection,
    ProductSnapshot,
    read_at_least_revision,
    read_current_projection,
    sleep_before_read,
)


class Case06Test(unittest.TestCase):
    def test_minimum_revision(self):
        projection = ProductProjection()
        projection.put(ProductSnapshot("Product42", 43, 100))
        self.assertEqual(read_current_projection(projection, "Product42").snapshot.revision, 43)
        self.assertEqual(sleep_before_read(projection, "Product42", 0).snapshot.revision, 43)
        self.assertEqual(read_at_least_revision(projection, "Product42", 44).status, "NOT_FRESH_ENOUGH")
        self.assertEqual(read_at_least_revision(projection, "Product42", 0).snapshot.revision, 43)
        projection.put(ProductSnapshot("Product42", 44, 120))
        self.assertEqual(read_at_least_revision(projection, "Product42", 44).snapshot.revision, 44)
        projection.put(ProductSnapshot("Product42", 45, 125))
        self.assertEqual(read_at_least_revision(projection, "Product42", 44).snapshot.price, 125)
        cache = ProductProjection()
        cache.put(ProductSnapshot("Product42", 43, 100))
        self.assertEqual(read_at_least_revision(cache, "Product42", 44).status, "NOT_FRESH_ENOUGH")


if __name__ == "__main__":
    unittest.main()
