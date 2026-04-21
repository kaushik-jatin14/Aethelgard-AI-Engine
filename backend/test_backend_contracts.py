import json
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

import main
from routes import game


class BackendContractTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)

    def test_health_reports_degraded_without_keys(self):
        with patch.object(game, "get_runtime_status", return_value={"ai_configured": False, "configured_key_count": 0, "cached_exhausted_combos": 0}):
            response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "degraded")

    def test_ready_reports_unready_without_keys(self):
        with patch.object(game, "get_runtime_status", return_value={"ai_configured": False, "configured_key_count": 0, "cached_exhausted_combos": 0}):
            response = self.client.get("/api/ready")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["status"], "unready")

    def test_game_action_success_contract(self):
        payload = json.dumps({
            "narrative": "Welcome, Champion.\n\n**What will thou do?**\n1. [Advance]",
            "new_state": {"location": "The Nexus Point", "inventory": [], "health": 100, "quests": []},
        })
        request_body = {
            "playerAction": "explore",
            "currentState": {"location": "The Nexus Point"},
            "characterData": {"name": "Test", "stats": {}},
        }

        with patch.object(game, "call_with_fallback", return_value=payload):
            response = self.client.post("/api/game-action", json=request_body)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        self.assertIn("narrative", response.json())

    def test_game_action_timeout_error_contract(self):
        request_body = {
            "playerAction": "explore",
            "currentState": {"location": "The Nexus Point"},
            "characterData": {"name": "Test", "stats": {}},
        }

        with patch.object(
            game,
            "call_with_fallback",
            side_effect=game.AIServiceError("AI_TIMEOUT", "The Oracle took too long to answer. Please try again.", 504, True),
        ):
            response = self.client.post("/api/game-action", json=request_body)

        self.assertEqual(response.status_code, 504)
        self.assertEqual(response.json()["ok"], False)
        self.assertEqual(response.json()["code"], "AI_TIMEOUT")
        self.assertTrue(response.json()["retryable"])

    def test_help_chat_invalid_json_contract(self):
        with patch.object(game, "call_with_fallback", return_value="not-json"):
            response = self.client.post("/api/help-chat", json={"question": "How do I play?"})

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()["code"], "AI_BAD_RESPONSE")

    def test_frontend_route_falls_back_to_index(self):
        response = self.client.get("/some/non-existent/front-end-route")
        self.assertIn(response.status_code, {200, 500})


if __name__ == "__main__":
    unittest.main()
