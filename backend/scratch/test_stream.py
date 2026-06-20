import urllib.request
import json
import sys

url = "http://localhost:8000/chat/stream"
# Let's create a session first to have a valid session ID
session_url = "http://localhost:8000/sessions"
session_data = {"title": "Test Stream Conversation", "specialty": "General", "mode": "Chat"}

try:
    # 1. Create session
    req_sess = urllib.request.Request(
        session_url,
        data=json.dumps(session_data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req_sess) as res_sess:
        sess_resp = json.loads(res_sess.read().decode("utf-8"))
        session_id = sess_resp["id"]
        print(f"Session created with ID: {session_id}")

    # 2. Test Stream
    data = {
        "session_id": session_id,
        "message": "How is asthma managed and what are the common medications used?"
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    print("\nStarting stream request...")
    with urllib.request.urlopen(req) as res:
        print(f"Response status: {res.status}")
        print("Streaming response:")
        while True:
            line = res.readline()
            if not line:
                break
            decoded_line = line.decode("utf-8").strip()
            if decoded_line:
                print(decoded_line)
                sys.stdout.flush()

except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.reason}", file=sys.stderr)
    print(e.read().decode("utf-8"), file=sys.stderr)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
