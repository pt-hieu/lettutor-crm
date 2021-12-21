#!/bin/sh

docker stop artemis || true
docker build . -t crm:frontend
docker run --rm --name artemis -d -p 3000:3000 crm:frontend
