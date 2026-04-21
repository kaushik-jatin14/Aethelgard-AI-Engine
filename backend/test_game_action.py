import json

import requests


def main():
    url = "http://localhost:8000/api/game-action"
    data = {
        "playerAction": "I explore the ruins looking for ancient secrets.",
        "currentState": {"location": "The Nexus Point", "inventory": [], "health": 100, "quests": []},
        "characterData": {
            "name": "Aethel",
            "title": "The First",
            "weapon": "Sun Sword",
            "startLocation": "The Nexus Point",
            "stats": {"strength": 10, "agility": 10, "magic": 10, "stealth": 10},
            "mission": "Restore the light.",
        },
    }
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, data=json.dumps(data), headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as exc:
        print(f"Error: {exc}")


if __name__ == "__main__":
    main()
