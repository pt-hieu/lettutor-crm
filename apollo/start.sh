#!/bin/sh

docker stop backend || true
docker build . -t crm:backend
docker run --rm --name backend -d -p 8000:8000 crm:backend
