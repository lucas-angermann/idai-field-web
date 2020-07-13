# iDAI.field Web

## Getting started

Prepare the configuration:

    $ cp api/config/config.exs.template api/config/config.exs
    $ vi api/config/config.exs # Edit configuration

Start elasticsearch and the api web service with docker:

    $ docker-compose up

Trigger indexing:

    $ curl -XPOST localhost:4000/reindex

Start the web UI:

    $ cd ui
    $ npm i
    $ npm start

Visit `http://localhost:3000`.

## Test Data

To set up test data, and provide them via elasticsearch, do:


    $ docker-compose up elasticsearch
    $ ./put-test-data.sh

Test via `http://localhost:9200/idai-field/_search`.

## API

The api runs on port 4000. Indexed documents can be retrieved via `http://localhost:4000/documents`.

It can be run independently with the following command:

    $ docker-compose up api

or interactively with iex:

    $ docker-compose run --service-ports --entrypoint "iex -S mix" api


## UI

The frontend runs on port 3000. It autmatically picks the next available port if 3000 is already in use.

Start the development server with:

    $ cd ui
    $ npm start

To install dependencies use:

    $ npm i

To build for production use:

    $ npm run build


## Elasticsearch

The elasticsearch REST API runs on port 9200. Indexed documents can be retrieved via
`http://localhost:9200/idai-field/_search`.

It can be started independently with:

    $ docker-compose up elasticsearch

## Unit testing

    $ docker-compose run --service-ports --entrypoint "mix test test/app && mix test --no-start test/unit" api

or
 
    $ docker-compose run --entrypoint "/bin/bash" api
    $ mix test test/app && mix test --no-start test/unit

## (Re-)building containers

    $ docker-compose up --build api
