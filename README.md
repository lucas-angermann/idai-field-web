# iDAI.field Web

## Prerequisites

* Docker
* docker-compose

## Getting started

Prepare the configuration:

    $ cd api
    $ cp config/dev_prod.exs.template config/dev.exs
    $ vi config/dev.exs                                  # Edit configuration

Start elasticsearch, cantaloupe and the api web service with docker:

    $ docker-compose up

Trigger indexing

    $ curl -XPOST localhost:4000/api/worker/update_mapping
    $ curl -XPOST localhost:4000/api/worker/reindex
    $ curl -XPOST localhost:4000/api/worker/conversion # if one has images from the client
    $ curl -XPOST localhost:4000/api/worker/tiling     # if there are georeferenced images
    
or alternatively generate test data

    $ docker-compose up elasticsearch
    $ ./put-test-data.sh                          # TODO review if this still works
    
If you have images, place them under `data/cantaloupe` (or override the docker-compose configuration as described further below, to change the default location)

Generate tiles

    $ curl -XPOST localhost:4000/api/tiling

Start the web UI:

    $ cd ui
    $ npm i
    $ npm start

Visit `http://localhost:3001`.

## Development

### Components

#### API

It can be run independently with the following command:

    $ docker-compose up api
    
The api runs on port 4000. Indexed documents can be retrieved via `http://localhost:4000/documents`.

#### Testing

    $ docker-compose run --service-ports --entrypoint "mix test test/app && mix test --no-start test/unit" api

or
 
    $ docker-compose run --entrypoint "/bin/bash" api
    $ mix test test/app                 # application/subsystem tests
    $ mix test --no-start test/unit     # unit tests

#### Interactive Elixir

    $ docker-compose run --service-ports --entrypoint "iex -S mix" api

#### UI

The frontend runs on port 3001. It autmatically picks the next available port if 3001 is already in use.

To build for production use:

    $ npm run build

#### Elasticsearch

It can be started independently with:

    $ docker-compose up elasticsearch
    
The elasticsearch REST API runs on port 9200. Indexed documents can be retrieved via
`http://localhost:9200/idai-field/_search`.

#### Cantaloupe

Can be started independently with

    $ docker-compose up cantaloupe
    
### Override docker-compose configuration to change image directories

in config.exs

In order to be able to see images you can override the images volume by creating
a `docker-compose.override.yml` that contains the volume definition. This
file gets automatically picked up by `docker-compose` and will not be published
to the repository.

docker-compose.override.yml

    version: "3.7"
    
    services:
        cantaloupe:
            volumes:
                - "/host/environment/path/to/images/project_a_name:/imageroot/project_a_name"
                - "/host/environment/path/to/images/project_b_name:/imageroot/project_b_name"
            
        api:    
            volumes:
                - "/host/environment/path/to/images/project_a_name:/imageroot/project_a_name"
                - "/host/environment/path/to/images/project_b_name:/imageroot/project_b_name"
            
### Managing containers
            
#### (Re-)building containers

    $ docker-compose up --build api

#### Managing dependencies

In order to add a dependency it has to be added to `mix.exs`. Afterwards, the api docker container
has to be rebuilt explicitly with:

    $ docker-compose build api

After removing a dependency from `mix.exs` the following command has to be run inside api/ to make
sure `mix.lock` reflects the change:

    $ mix deps.clean --unused --unlock

Afterwards, the api docker container has to be rebuilt explicitly with:

    $ docker-compose build api