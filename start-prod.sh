#!/bin/sh

docker stop artemis || true
docker pull ghcr.io/pt-hieu/lettutor-crm:artemis-prod
docker run --rm --name artemis -d -p 3000:3000 ghcr.io/pt-hieu/lettutor-crm:artemis-prod
cd ~/lettutor-crm/apollo
docker-compose down -f docker-compose.prod.yaml
docker-compose pull apollo -f docker-compose.prod.yaml
docker-compose up -d -f docker-compose.prod.yaml
yes | docker image prune
