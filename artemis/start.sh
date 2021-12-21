#!/bin/sh

docker stop frontend || true
docker build . -t crm:frontend
docker run --rm --name frontend -d -p 3000:3000 crm:frontend
