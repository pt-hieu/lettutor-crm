#!/bin/sh

docker build . -t crm:backend
docker stop backend || true
docker rm backend || true
docker run --rm --name backend -d -p 3000:3000 crm:backend
