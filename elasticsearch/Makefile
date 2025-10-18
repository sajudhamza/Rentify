# Makefile for Rentify Elasticsearch integration


# Default configs
SINGLE_COMPOSE=docker/docker-compose.single.yml
CLUSTER_COMPOSE=docker/docker-compose.cluster.yml
API_MODULE=scripts.search_api
SEED_SCRIPT=scripts/seed_data.py


# Bring up single-node Elasticsearch
up-single:
	docker compose -f $(SINGLE_COMPOSE) up -d


# Bring down single-node Elasticsearch
down-single:
	docker compose -f $(SINGLE_COMPOSE) down -v


# Bring up multi-node cluster
up-cluster:
	docker compose -f $(CLUSTER_COMPOSE) up -d


# Bring down multi-node cluster
down-cluster:
	docker compose -f $(CLUSTER_COMPOSE) down -v


# Run FastAPI app
run-api:
	uvicorn $(API_MODULE):app --host 0.0.0.0 --port 8001 --reload


# Seed data into Elasticsearch
seed:
	python3 $(SEED_SCRIPT)


# View Elasticsearch cluster health
health:
	curl -s http://localhost:9200/_cluster/health?pretty


# List Elasticsearch nodes
nodes:
	curl -s http://localhost:9200/_cat/nodes?v


# Clean all volumes
clean:
	docker volume rm $$(docker volume ls -qf dangling=true) || true


.PHONY: 
	up-single down-single up-cluster down-cluster run-api seed health nodes clean