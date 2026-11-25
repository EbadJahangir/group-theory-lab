"""Unit tests for dihedral groups D_n."""

import unittest

from backend.math_engine.dihedral import analyze_dihedral_group


class TestDihedralGroups(unittest.TestCase):
    def test_d6_structure_and_centre(self):
        d6 = analyze_dihedral_group(6, include_cayley=True)
        self.assertEqual(d6["order"], 12)
        self.assertEqual(d6["centre"], ["e", "r^3"])
        self.assertTrue(d6["centre_verified"])
        self.assertIsNotNone(d6["cayley_table"])

        by_label = {e["label"]: e for e in d6["elements"]}
        self.assertEqual(by_label["e"]["order"], 1)
        self.assertEqual(by_label["r"]["order"], 6)
        self.assertEqual(by_label["r^2"]["order"], 3)
        self.assertEqual(by_label["r^3"]["order"], 2)
        for elem in d6["elements"]:
            if elem["is_reflection"]:
                self.assertEqual(elem["order"], 2)

    def test_d8_structure_and_centre(self):
        d8 = analyze_dihedral_group(8)
        self.assertEqual(d8["order"], 16)
        self.assertEqual(d8["centre"], ["e", "r^4"])
        self.assertTrue(d8["centre_verified"])
        order2_count = sum(1 for e in d8["elements"] if e["order"] == 2)
        self.assertEqual(order2_count, 9)

    def test_d5_odd_centre(self):
        d5 = analyze_dihedral_group(5)
        self.assertEqual(d5["order"], 10)
        self.assertEqual(d5["centre"], ["e"])
        self.assertTrue(d5["centre_verified"])


if __name__ == "__main__":
    unittest.main()
