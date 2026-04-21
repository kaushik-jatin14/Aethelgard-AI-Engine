import json

import requests


def main():
    url = "http://localhost:8000/api/help-chat"
    data = {"question": "How do I play?"}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, data=json.dumps(data), headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as exc:
        print(f"Error: {exc}")


if __name__ == "__main__":
    main()
