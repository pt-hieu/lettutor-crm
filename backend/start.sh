#!/bin/sh

docker build . -t crm:backend
docker stop crm:backend || true
docker rm crm:backend || true
docker run --rm --name crm:backend -d -p 3000:3000 crm:backend
