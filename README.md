# iDAI.field Web

## Getting started

Prepare the configuration:

    $ cp api/config/dev_prod.exs.template api/config/dev.exs
    $ cp api/config/dev_prod.exs.template api/config/prod.exs
    $ vi api/config/dev.exs # Edit configuration
    $ vi api/config/prod.exs # Edit configuration

Start elasticsearch and the api web service with docker:

    $ docker-compose up

Trigger indexing:

    $ curl -XPOST localhost:4000/api/reindex

Start the web UI:

    $ cd ui
    $ npm i
    $ npm start

Visit `http://localhost:3000`.

In order to be able to see images the network volume `smb://bcloud/bclou03/idaiworld-scans/idaifield``
has to be mounted and symlinked to `./api/images`.

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


### Managing dependencies

In order to add a dependency it has to be added to `mix.exs`. Afterwards, the api docker container
has to be rebuilt explicitly with:

    $ docker-compose build api

After removing a dependency from `mix.exs` the following command has to be run inside api/ to make
sure `mix.lock` reflects the change:

    $ mix deps.clean --unused --unlock

Afterwards, the api docker container has to be rebuilt explicitly with:

    $ docker-compose build api


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

## Testing

    $ docker-compose run --service-ports --entrypoint "mix test test/app && mix test --no-start test/unit" api

or
 
    $ docker-compose run --entrypoint "/bin/bash" api
    $ mix test test/app                 # application/subsystem tests
    $ mix test --no-start test/unit     # unit tests

## (Re-)building containers

    $ docker-compose up --build api
