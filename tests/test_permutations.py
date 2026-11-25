"""Unit tests for permutations, symmetric groups, and alternating groups."""

import unittest

from backend.math_engine.permutations import analyze_permutation, explore_symmetric_group
from backend.validation.validators import ValidationError


class TestPermutations(unittest.TestCase):
    def test_cycle_decomposition_order_and_sign(self):
        # (1 2 3)(4 5) in S_5 -> one-line [2, 3, 1, 5, 4]
        res = analyze_permutation([2, 3, 1, 5, 4])
        self.assertEqual(res["n"], 5)
        self.assertEqual(res["cycle_notation"], "(1 2 3)(4 5)")
        self.assertEqual(res["order"], 6)
        self.assertEqual(res["sign"], -1)
        self.assertEqual(res["parity"], "odd")

    def test_cycle_input_parsing(self):
        res = analyze_permutation("(1 2 3)(4 5)", expected_n=5)
        self.assertEqual(res["one_line"], [2, 3, 1, 5, 4])
        self.assertEqual(res["order"], 6)
        self.assertFalse(res["is_even"])

    def test_s5_even_permutations_count_60(self):
        s5 = explore_symmetric_group(5)
        self.assertEqual(s5["total_order"], 120)
        self.assertEqual(s5["even_count"], 60)
        self.assertEqual(s5["odd_count"], 60)
        self.assertTrue(s5["an_verified"])

        # Verify at least one order-6 element exists and all order-6 elements in S_5 are odd
        order6 = [p for p in s5["permutations"] if p["order"] == 6]
        self.assertGreater(len(order6), 0)
        for p in order6:
            self.assertEqual(p["parity"], "odd")

    def test_duplicate_permutation_rejected(self):
        with self.assertRaises(ValidationError):
            analyze_permutation([1, 2, 2, 4])


if __name__ == "__main__":
    unittest.main()
