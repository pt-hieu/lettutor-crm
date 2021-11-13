#!/bin/sh

docker build . -t crm:backend
docker stop backend || true
docker rm backend || true
docker run --rm --name backend -d -p 8000:8000 crm:backend
