import requests

url = "https://aethelgard-oracle.onrender.com/api/help-chat"
data = {"question": "How do I start?"}

try:
    print(f"Testing live Gate Keeper at {url}...")
    response = requests.post(url, json=data, timeout=60)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")
