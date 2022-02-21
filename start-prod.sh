#!/bin/bash

for component in "$@"
do
  case ${component} in
    artemis)
      docker-compose -f docker/docker-compose.prod.yaml stop artemis
      yes | docker-compose -f docker/docker-compose.prod.yaml rm artemis
      docker-compose -f docker/docker-compose.prod.yaml pull artemis
      docker-compose -f docker/docker-compose.prod.yaml create artemis
      docker-compose -f docker/docker-compose.prod.yaml start artemis
      ;;
    apollo)
      docker-compose -f docker/docker-compose.prod.yaml stop apollo
      yes | docker-compose -f docker/docker-compose.prod.yaml rm apollo
      docker-compose -f docker/docker-compose.prod.yaml pull apollo
      docker-compose -f docker/docker-compose.prod.yaml create apollo
      docker-compose -f docker/docker-compose.prod.yaml start apollo
      ;;
    poseidon)
      docker-compose -f docker/docker-compose.prod.yaml stop poseidon
      yes | docker-compose -f docker/docker-compose.prod.yaml rm poseidon
      docker-compose -f docker/docker-compose.prod.yaml pull poseidon
      docker-compose -f docker/docker-compose.prod.yaml create poseidon
      docker-compose -f docker/docker-compose.prod.yaml start poseidon
      ;;
    zeus)
      docker-compose -f docker/docker-compose.prod.yaml stop zeus
      yes | docker-compose -f docker/docker-compose.prod.yaml rm zeus
      docker-compose -f docker/docker-compose.prod.yaml pull zeus
      docker-compose -f docker/docker-compose.prod.yaml create zeus
      docker-compose -f docker/docker-compose.prod.yaml start zeus
      ;;
  esac
done

yes | docker image prune
