"""Unit tests for Cayley table generation and group axiom verification."""

import unittest

from backend.math_engine.cayley import generate_cayley_table, verify_cayley_table


class TestCayleyTables(unittest.TestCase):
    def test_z4_cayley_table_axioms(self):
        res = generate_cayley_table({"group_type": "abelian", "moduli": [4]})
        self.assertEqual(res["order"], 4)
        v = res["verification"]
        self.assertTrue(v["closure"]["passed"])
        self.assertTrue(v["identity"]["passed"])
        self.assertEqual(v["identity"]["element"], "0")
        self.assertTrue(v["inverses"]["passed"])
        self.assertTrue(v["associativity"]["passed"])
        self.assertTrue(v["commutativity"]["passed"])
        self.assertTrue(v["is_group"])
        self.assertTrue(v["is_abelian_group"])

    def test_s3_cayley_non_abelian(self):
        res = generate_cayley_table({"group_type": "permutation", "n": 3})
        self.assertEqual(res["order"], 6)
        v = res["verification"]
        self.assertTrue(v["is_group"])
        self.assertFalse(v["commutativity"]["passed"])
        self.assertFalse(v["is_abelian_group"])

    def test_non_associative_custom_table_fails(self):
        # Subtraction modulo 3: (a - b) mod 3 is NOT associative
        labels = ["0", "1", "2"]
        matrix = [
            ["0", "2", "1"],
            ["1", "0", "2"],
            ["2", "1", "0"],
        ]
        v = verify_cayley_table(labels, matrix)
        self.assertTrue(v["closure"]["passed"])
        self.assertFalse(v["identity"]["passed"])
        self.assertFalse(v["associativity"]["passed"])
        self.assertFalse(v["is_group"])


if __name__ == "__main__":
    unittest.main()
