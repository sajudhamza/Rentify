from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from elasticsearch import Elasticsearch, NotFoundError
from typing import List, Dict, Optional
import os

ES_URL = os.getenv("ES_URL", "http://127.0.0.1:9200")
INDEX_NAME = os.getenv("ES_INDEX", "rentify-listings")

es = Elasticsearch(ES_URL, verify_certs=False,
    ssl_show_warn=False,)
app = FastAPI(title="Rentify Search API")

class Listing(BaseModel):
    title: str
    description: str
    price: float
    currency: str
    category: str
    tags: List[str] = []
    location: Optional[Dict] = None
    available: bool = True

@app.on_event("startup")
async def check_es():
    try:
        if not es.ping():
            raise RuntimeError("Elasticsearch unreachable")
    except Exception as e:
        raise RuntimeError(f"Elasticsearch connection failed: {e}")

@app.post("/index")
def index_listing(listing: Listing):
    res = es.index(index=INDEX_NAME, document=listing.dict(), refresh="wait_for")
    return {"result": res["result"], "id": res["_id"]}

@app.get("/search")
def search(
    q: str = Query("", alias="q"),
    min_price: float = 0,
    max_price: float = 1e9,
    tags: Optional[List[str]] = Query(None),
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius_km: int = 10,
    page: int = 0,
    size: int = 20,
):
    must = []
    if q:
        must.append({
            "multi_match": {
                "query": q,
                "fields": ["title^3", "description"]
            }
        })

    filter_clauses = [{"range": {"price": {"gte": min_price, "lte": max_price}}}]
    if tags:
        filter_clauses.append({"terms": {"tags": tags}})
    if lat is not None and lon is not None:
        filter_clauses.append({
            "geo_distance": {
                "distance": f"{radius_km}km",
                "location": {"lat": lat, "lon": lon}
            }
        })

    body = {
        "query": {
            "bool": {
                "must": must if must else {"match_all": {}},
                "filter": filter_clauses
            }
        },
        "from": page * size,
        "size": size
    }

    try:
        resp = es.search(index=INDEX_NAME, body=body)
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")

    hits = [h["_source"] for h in resp["hits"]["hits"]]
    return {"took": resp["took"], "total": resp["hits"]["total"], "hits": hits}
