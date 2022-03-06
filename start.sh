#!/bin/bash

for component in "$@"
do
  case ${component} in
    artemis)
      docker-compose -f docker/docker-compose.yaml stop artemis
      yes | docker-compose -f docker/docker-compose.yaml rm artemis
      docker-compose -f docker/docker-compose.yaml pull artemis
      docker-compose -f docker/docker-compose.yaml create artemis
      docker-compose -f docker/docker-compose.yaml start artemis
      ;;
    ares)
      docker-compose -f docker/docker-compose.yaml stop ares
      yes | docker-compose -f docker/docker-compose.yaml rm ares
      docker-compose -f docker/docker-compose.yaml pull ares
      docker-compose -f docker/docker-compose.yaml create ares
      docker-compose -f docker/docker-compose.yaml start ares
      ;;
    apollo)
      docker-compose -f docker/docker-compose.yaml stop apollo
      yes | docker-compose -f docker/docker-compose.yaml rm apollo
      docker-compose -f docker/docker-compose.yaml pull apollo
      docker-compose -f docker/docker-compose.yaml create apollo
      docker-compose -f docker/docker-compose.yaml start apollo
      ;;
    poseidon)
      docker-compose -f docker/docker-compose.yaml stop poseidon
      yes | docker-compose -f docker/docker-compose.yaml rm poseidon
      docker-compose -f docker/docker-compose.yaml pull poseidon
      docker-compose -f docker/docker-compose.yaml create poseidon
      docker-compose -f docker/docker-compose.yaml start poseidon
      ;;
    zeus)
      docker-compose -f docker/docker-compose.yaml stop zeus
      yes | docker-compose -f docker/docker-compose.yaml rm zeus
      docker-compose -f docker/docker-compose.yaml pull zeus
      docker-compose -f docker/docker-compose.yaml create zeus
      docker-compose -f docker/docker-compose.yaml start zeus
      ;;
  esac
done

yes | docker image prune
