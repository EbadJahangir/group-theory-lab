"""Unit tests for Abelian groups and finite Abelian group classification."""

import unittest

from backend.math_engine.abelian import analyze_abelian_group
from backend.math_engine.classification import classify_abelian_groups
from backend.validation.validators import ValidationError


class TestAbelianGroups(unittest.TestCase):
    def test_z4_structure_and_orders(self):
        z4 = analyze_abelian_group([4])
        self.assertEqual(z4["order"], 4)
        self.assertEqual(z4["identity"], "0")
        self.assertTrue(z4["is_cyclic"])
        self.assertEqual(z4["generators"], ["1", "3"])

        by_label = {e["label"]: e for e in z4["elements"]}
        self.assertEqual(by_label["0"]["order"], 1)
        self.assertEqual(by_label["0"]["inverse"], "0")
        self.assertEqual(by_label["1"]["order"], 4)
        self.assertEqual(by_label["1"]["inverse"], "3")
        self.assertEqual(by_label["2"]["order"], 2)
        self.assertEqual(by_label["2"]["inverse"], "2")
        self.assertEqual(by_label["3"]["order"], 4)
        self.assertEqual(by_label["3"]["inverse"], "1")

    def test_z2_cross_z2_not_cyclic(self):
        v4 = analyze_abelian_group([2, 2])
        self.assertEqual(v4["order"], 4)
        self.assertEqual(v4["identity"], "(0, 0)")
        self.assertFalse(v4["is_cyclic"])
        self.assertEqual(v4["generators"], [])
        self.assertEqual(v4["max_element_order"], 2)
        for elem in v4["elements"]:
            if elem["is_identity"]:
                self.assertEqual(elem["order"], 1)
            else:
                self.assertEqual(elem["order"], 2)

    def test_direct_product_lcm_order(self):
        g = analyze_abelian_group([4, 6])
        self.assertEqual(g["order"], 24)
        self.assertFalse(g["is_cyclic"])
        self.assertEqual(g["max_element_order"], 12)
        by_label = {e["label"]: e for e in g["elements"]}
        # In Z4 x Z6, (1, 1) has ord(1)=4, ord(1)=6 => lcm(4,6)=12
        self.assertEqual(by_label["(1, 1)"]["order"], 12)
        # (2, 3) has ord(2)=2, ord(3)=2 => lcm(2,2)=2
        self.assertEqual(by_label["(2, 3)"]["order"], 2)

    def test_classification_order_72(self):
        res = classify_abelian_groups(72)
        self.assertEqual(res["n"], 72)
        self.assertEqual(res["total_groups"], 6)
        self.assertTrue(res["all_orders_verified"])
        for grp in res["groups"]:
            self.assertEqual(grp["verified_order"], 72)
            self.assertTrue(grp["elementary_order_verified"])
            self.assertTrue(grp["divisibility_verified"])

    def test_invalid_inputs_rejected(self):
        with self.assertRaises(ValidationError):
            analyze_abelian_group([0])
        with self.assertRaises(ValidationError):
            analyze_abelian_group([-4])
        with self.assertRaises(ValidationError):
            analyze_abelian_group([500])


if __name__ == "__main__":
    unittest.main()
