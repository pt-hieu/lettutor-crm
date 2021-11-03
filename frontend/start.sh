#!/bin/sh

docker build . -t crm:frontend
docker stop crm:frontend || true
docker rm crm:fronend || true
docker run --rm --name crm:frontend -d -p 3000:3000 crm:frontend
