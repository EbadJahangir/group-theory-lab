"""Unit tests for Euler's totient function and cyclic group generators."""

import unittest

from backend.math_engine.generators import analyze_totient, totient_table


class TestGeneratorsAndPhi(unittest.TestCase):
    def test_phi_1_through_20(self):
        expected = {
            1: 1, 2: 1, 3: 2, 4: 2, 5: 4,
            6: 2, 7: 6, 8: 4, 9: 6, 10: 4,
            11: 10, 12: 4, 13: 12, 14: 6, 15: 8,
            16: 8, 17: 16, 18: 6, 19: 18, 20: 8,
        }
        table = totient_table(20)
        self.assertTrue(table["all_verified"])
        for row in table["rows"]:
            n = row["n"]
            self.assertEqual(row["phi"], expected[n])
            self.assertEqual(row["generator_count"], expected[n])

    def test_z1_edge_case(self):
        z1 = analyze_totient(1)
        self.assertEqual(z1["phi"], 1)
        self.assertEqual(z1["generators"], [0])
        self.assertTrue(z1["verified"])


if __name__ == "__main__":
    unittest.main()
