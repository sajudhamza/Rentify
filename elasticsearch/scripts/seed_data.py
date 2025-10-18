# scripts/seed_data.py
from pathlib import Path
import json
import time
import requests
absolute_path = Path(__file__).absolute()

INDEX = "rentify-listings"
MAPPINGS_FILE = absolute_path.parent.parent / "mappings.json"

ES_URL = "http://localhost:9200"

SAMPLE_DOCS = [
    {
    "title": "2BR apartment downtown",
    "description": "Bright, close to subway",
    "price": 1200.0,
    "currency": "USD",
    "category": "apartment",
    "tags": ["balcony", "pets"],
    "location": {"lat": 41.8781, "lon": -87.6298},
    "available": True,
    "posted_at": "2025-10-01T10:00:00Z"
    },
    {
    "title": "Cozy studio near park",
    "description": "Perfect for students",
    "price": 700.0,
    "currency": "USD",
    "category": "studio",
    "tags": ["parking"],
    "location": {"lat": 41.881, "lon": -87.623},
    "available": True,
    "posted_at": "2025-09-20T12:00:00Z"
    },
    {
    "title": "Spacious 3BR house",
    "description": "Large backyard, family friendly",
    "price": 2500.0,
    "currency": "USD",
    "category": "house",
    "tags": ["garden","garage"],
    "location": {"lat": 41.9, "lon": -87.65},
    "available": False,
    "posted_at": "2025-08-05T09:00:00Z"
    }
]



def wait_for_es(timeout=60):
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get(ES_URL)
            if r.status_code == 200:
                return True
        except Exception:
            pass
        time.sleep(1)
    return False




def create_index():
    if not MAPPINGS_FILE.exists():
        print("Mappings file not found:", MAPPINGS_FILE)
        return
with open(MAPPINGS_FILE, "r") as f:
    mappings = json.load(f)


r = requests.put(f"{ES_URL}/{INDEX}", json=mappings)
print("Create index response:", r.status_code, r.text)




def seed_docs():
    for doc in SAMPLE_DOCS:
        r = requests.post(f"{ES_URL}/{INDEX}/_doc?refresh=wait_for", json=doc)
        print("Indexed:", r.status_code, r.json().get("result"))




if __name__ == "__main__":
    print("Waiting for Elasticsearch...")
    ok = wait_for_es(120)
    if not ok:
        print("Elasticsearch did not become available in time")
        exit(1)
    create_index()
    seed_docs()
    print("Seeding complete")