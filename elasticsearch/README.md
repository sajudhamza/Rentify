How to use

Copy the files into your repo under the same relative paths.

From the repo root run make -C . up-single to bring up a single-node Elasticsearch and make seed to seed sample data.

To run the multi-node cluster, make up-cluster (requires more RAM). Use make down-cluster to bring it down.

Start the FastAPI search service: make run-api and visit http://localhost:8000/docs.



Next steps you can run locally (from your repo root):

Copy the files from the canvas into your repo (paths shown in the document).

Start a single-node dev cluster:

make up-single

make seed

Start the FastAPI search API:

make run-api then open http://localhost:8001/docs

To experiment with the multi-node cluster:

make up-cluster (wait longer; needs more RAM)

./scripts/bootstrap_cluster.sh will bring it up and seed data




📘 Makefile Usage Guide
Command	Description
make up-single	Starts a single-node Elasticsearch instance for development (on port 9200).
make down-single	Stops and removes the single-node instance and its volumes.
make up-cluster	Launches a 4-node Elasticsearch cluster (master, 2 data, 1 ML node).
make down-cluster	Stops and removes the entire multi-node cluster.
make run-api	Starts the FastAPI search service on port 8000.
make seed	Executes the seeding script to populate Elasticsearch with sample data.
make health	Prints the current Elasticsearch cluster health in JSON format.
make nodes	Lists all nodes in the running cluster.
make clean	Removes unused Docker volumes to free disk space.

💡 Pro tips:

Run make up-single during development; it’s lightweight and fast.

Use make up-cluster when you need to test distributed behavior.

Always check make health after startup to ensure the cluster is green.

The FastAPI app auto-reloads when you change code files.



How to expand to 3–5 node cluster & role suggestions

Common production patterns:

3 master-eligible nodes (highly recommended for HA)

2+ data nodes (sharding & redundancy)

1 or more ingest nodes (pre-processing)

1 dedicated ML node (if you plan to use Elastic Machine Learning)

optionally: 1 coordinating-only node for client load balancing

To expand:

add services es-master2, es-master3 in the compose file with node.roles=master and include them in discovery.seed_hosts and cluster.initial_master_nodes during first cluster bootstrap.

add more es-dataN services.

ensure each node has adequate memory and ES_JAVA_OPTS set (recommended heap = 50% of host RAM up to ~30-31GB).


# curl -X PUT "http://localhost:9200/rentify-listings?pretty" -H 'Content-Type: application/json' -d @mappings.json


curl -X POST "http://localhost:9200/rentify-listings/_doc?refresh" -H 'Content-Type: application/json' -d '{
  "title": "2BR apartment downtown",
  "description": "Bright, close to subway",
  "price": 1200.0,
  "currency": "USD",
  "category":"apartment",
  "tags":["balcony","pets"],
  "location": { "lat": 41.8781, "lon": -87.6298 },
  "available": true,
  "posted_at": "2025-10-01T10:00:00Z"
}'


POST /rentify-listings/_search
{
  "query": {
    "bool": {
      "must": [
        { "multi_match": {
            "query": "bright apartment downtown",
            "fields": ["title^3","description"]
        }}
      ],
      "filter": [
        { "term": { "currency": "USD" }},
        { "range": { "price": { "gte": 500, "lte": 2000 }}},
        { "term": { "available": true }},
        {
          "geo_distance": {
            "distance": "10km",
            "location": { "lat": 41.8781, "lon": -87.6298 }
          }
        }
      ]
    }
  },
  "sort": [
    { "_score": "desc" },
    { "price": "asc" }
  ],
  "size": 20
}

POST /rentify-listings/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          {"to":500}, {"from":500,"to":1000}, {"from":1000,"to":2000}, {"from":2000}
        ]
      }
    },
    "tags": {
      "terms": { "field": "tags", "size": 10 }
    },
    "categories": {
      "terms": { "field": "category", "size": 10 }
    }
  }
}
