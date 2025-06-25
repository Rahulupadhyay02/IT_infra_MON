import requests
import time
import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime, timezone

# Step 1: Initialize Firebase
cred = credentials.Certificate("rr-group0208-firebase-adminsdk-fbsvc-119008a566.json")  # your downloaded key
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://rr-group0208-default-rtdb.firebaseio.com/"
})

# Step 2: EC2 Flask unified monitoring route
EC2_MONITOR_URL = "http://3.110.108.255:5000/api/server-info"

# Step 3: Fetch and push every 360 seconds
while True:
    print("📡 Fetching full monitoring snapshot...\n")
    try:
        res = requests.get(EC2_MONITOR_URL, timeout=60)
        data = res.json()

        # Firebase path timestamp-safe
        timestamp = datetime.now(timezone.utc).isoformat().replace(":", "-").replace(".", "-")
        ref = db.reference(f"/monitoring/server-info/{timestamp}")
        ref.set(data)

        print("✅ Successfully pushed server-info to Firebase.\n")

    except Exception as e:
        print(f"❌ Error fetching or pushing data: {e}")

    print("⏱️ Waiting 30 seconds...\n")
    time.sleep(30)
