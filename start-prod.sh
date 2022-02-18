#!/bin/sh

docker stop artemis || true
docker pull ghcr.io/pt-hieu/lettutor-crm:artemis-prod
docker run --rm --name artemis -d -p 3000:3000 ghcr.io/pt-hieu/lettutor-crm:artemis-prod
cd ~/lettutor-crm/apollo
docker-compose -f docker-compose.prod.yaml down 
docker-compose -f docker-compose.prod.yaml pull apollo
docker-compose -f docker-compose.prod.yaml up -d 
yes | docker image prune
