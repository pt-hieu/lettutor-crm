#!/bin/sh

docker build . -t crm:frontend
docker stop frontend || true
docker rm fronend || true
docker run --rm --name frontend -d -p 3000:3000 crm:frontend
