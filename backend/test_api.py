import json

import requests


def main():
    url = "http://127.0.0.1:8000/api/game-action"
    data = {
        "playerAction": "explore",
        "currentState": {"location": "The Nexus Point"},
        "characterData": {"name": "Test", "stats": {}},
    }

    try:
        response = requests.post(url, json=data, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as exc:
        print(f"Error: {exc}")


if __name__ == "__main__":
    main()
