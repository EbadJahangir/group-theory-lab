"""Integration tests for guided questions and API service dispatcher."""

import unittest

from backend.services.math_service import dispatch_endpoint


class TestGuidedAndAPI(unittest.TestCase):
    def test_guided_questions_and_checker(self):
        status, body = dispatch_endpoint("/api/guided/questions", "GET")
        self.assertEqual(status, 200)
        self.assertTrue(body["ok"])
        questions = body["data"]["questions"]
        self.assertEqual(len(questions), 6)

        # Check Q1..Q5 numeric answers and Q6 permutation answer
        answers = {
            1: 6,
            2: 8,
            3: 60,
            4: 9,
            5: 2,
            6: "(1 2 3)(4 5)",
        }
        for q_id, ans in answers.items():
            s, res = dispatch_endpoint("/api/guided/check", "POST", {"question_id": q_id, "answer": ans})
            self.assertEqual(s, 200)
            self.assertTrue(res["ok"])
            self.assertTrue(res["data"]["correct"])

    def test_api_validation_error_returns_400_without_traceback(self):
        status, body = dispatch_endpoint("/api/abelian/classify", "POST", {"n": -5})
        self.assertEqual(status, 400)
        self.assertFalse(body["ok"])
        self.assertIn("error", body)
        self.assertNotIn("Traceback", body["error"])


if __name__ == "__main__":
    unittest.main()
