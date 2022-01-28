#!/bin/sh

cd ~/lettutor-crm/poseidon
docker-compose down
docker-compose pull poseidon
docker-compose up -d
yes | docker image prune