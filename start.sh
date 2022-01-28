#!/bin/sh

for component in "$@"
do
  case ${component} in
    artemis)
      docker stop artemis || true
      docker pull ghcr.io/pt-hieu/lettutor-crm:artemis
      docker run --rm --name artemis -d -p 3000:3000 ghcr.io/pt-hieu/lettutor-crm:artemis
      ;;
    apollo)
      cd ~/lettutor-crm/apollo
      docker-compose down
      docker-compose pull apollo
      docker-compose up -d
      ;;
    poseidon)
      cd ~/lettutor-crm/poseidon
      docker-compose down
      docker-compose pull poseidon
      docker-compose up -d
      ;;
done

yes | docker image prune
