# iDAI.field Web

## Prerequisites

* Docker
* docker-compose
* A couchdb data source with data, as generated by dainst/idai-field-client

## Quickstart | API

Prepare the configuration:

    $ cd api
    $ cp config/dev_prod.exs.template config/dev.exs
    $ vi config/dev.exs # Edit

Set up a connection to a couchdb instance and configure at least one project (`projects: ["<project>"]`). 
Also make sure for the following curl commands to work withouth authentication in a quick demo,
that you give the anonymous user admin rights by setting `users: [%{ name: "anonymous", admin: true }]`. 

Start elasticsearch, cantaloupe and the api web service with docker and index all configured projects

    $ docker-compose up
    $ curl -XPOST localhost:4000/api/worker/reindex
    $ curl localhost:4000/api/documents             # See properly indexed documents via api

## Quickstart | UI

Visit the `ui` directory

    $ cd ui
    $ npm i

Prepare the configuration:

    $ cp src/configuration.json.template src/configuration.json
    $ vi src/configuration.json # Edit

Start the iDAI.field UI with `npm start` and visit `http://localhost:3001`.
Start the iDAI.shapes UI with `npm run start-shapes` and visit  `http://localhost:3002`.

## Quickstart | Images

For conversion of images and tiles run

    $ curl -XPOST localhost:4000/api/worker/conversion       # if one has images from the client
    $ curl -XPOST localhost:4000/api/worker/tiling           # if there are georeferenced images
    
If you have images, place them under `data/cantaloupe` (or override the docker-compose configuration as described further below, to change the default location)

## Usage | User-Managerment

The `Api.Auth` section of the active config file `dev.exs` has two parts, `users` and `readable_projects`. 

The `users` array has three possible keys: `name`, `pass` and `admin`. The name and pass values
are used to authenticate users, either directly via the API or via the user interfaces of either iDAI.field or iDAI.shapes. The admin property is optional and a boolean value which allows a given user to access all projects as well as to control all administrative functions via the API. 

There is one user, which always exists, even when not declared in the users array, which is `anonymous`. If one wants to speed up development, one can grant this user admin rights by declaring `%{ name: "anonymous", admin: true }` (the `pass` property is not necessary here).

The `readable_projects` section then determines, which of the configured projects can be seen by which users. `readable_projects` is a map, with user names as keys and arrays for the readable projects (chosen from `:api.projects`) the corresponding user. Here one can also specify which projects can be seen by anonymous users. For that, simply use the `:anynomous` or `"anonymous"` key and list the projects publicly accessible.

Users can sign in with the configured credentials via the user interfaces and see their readable projects. In addition to that they see all publicly accessible projects, which are, of course, also accessible without any login.

## Usage | API

In addition to handling of requests from the user interface, direct calls to API allow to access some extra administrative functionality.

### Authentication

As already said, development can happen with an anonymous user endowed with admin rights. The curl statements listed all refer usually to protected endpoints which are only accessible with admin permissions. To obtain a token via the api, one can do the following:

    $ curl -d '{ "name": "user-1", "pass": "pass-1" }' -H 'Content-Type: application/json' localhost:4000/api/auth/sign_in

The obtained token then can be used on subsequent requests to authenticate and authorize for using the protected endpoints. 

    $ curl -H "Authorization: Bearer [TOKEN]" localhost:4000/api/documents

For simplicity, we omit such authentication when listing calls to `curl` here.

### Indexing

To index a single project

    $ curl -XPOST localhost:4000/api/worker/update_mapping    # necessary at least once before reindexing any project
    $ curl -XPOST localhost:4000/api/worker/reindex/:project 

## Development

Note that containers can be started independently

    $ docker-compose up elasticsearch
    $ docker-compose up cantaloupe
    $ docker-compose up api

## Development | API

### Interactive Elixir

    $ docker-compose run --service-ports --entrypoint "iex -S mix" api

### Testing

    $ docker-compose run --service-ports --entrypoint "mix test test/app && mix test --no-start test/unit" api

or
 
    $ docker-compose run --entrypoint "/bin/bash" api
    $ mix test test/app                 # application/subsystem tests
    $ mix test --no-start test/unit     # unit tests

## Development | UI

The frontend runs on port 3001. It autmatically picks the next available port if 3001 is already in use.

To build for production use:

    $ npm run build
            
## Development | Managing containers
            
### (Re-)building containers

    $ docker-compose up --build api

### Managing dependencies

In order to add a dependency it has to be added to `mix.exs`. Afterwards, the api docker container
has to be rebuilt explicitly with:

    $ docker-compose build api

After removing a dependency from `mix.exs` the following command has to be run inside api/ to make
sure `mix.lock` reflects the change:

    $ mix deps.clean --unused --unlock

Afterwards, the api docker container has to be rebuilt explicitly with:

    $ docker-compose build api

## Development | Advanced

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

## Deployment

Use `docker-compose publish` to publish the docker images to dockerhub.

Afterwards make sure to pull the latest image versions from dockerhub in
the respective environment (e.g. portainer).
