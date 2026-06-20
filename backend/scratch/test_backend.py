import urllib.request
import json

def test_api():
    urls = [
        "http://127.0.0.1:8000/",
        "http://127.0.0.1:8000/health",
        "http://127.0.0.1:8000/sessions"
    ]
    for url in urls:
        print(f"Testing {url}...")
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as response:
                status = response.getcode()
                body = response.read().decode('utf-8')
                print(f"Status: {status}")
                print(f"Response: {body[:200]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
