#!/bin/sh

docker stop artemis || true
docker pull ghcr.io/pt-hieu/lettutor-crm:artemis
docker run --rm --name artemis -d -p 3000:3000 ghcr.io/pt-hieu/lettutor-crm:artemis
cd ~/lettutor-crm/apollo
docker-compose down
docker-compose pull apollo
docker-compose up -d
