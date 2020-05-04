# iDAI.field Web

## Getting started

## Data

To set up test data, and provide them via elasticsearch, do:

```
$ docker-compose up elasticsearch
$ ./put-test-data.sh
```

Test via `http://localhost:9200/idai-field/_search`.

## API

Prepare the configuration:

```
$ cp api/config/config.exs.template api/config/config.exs
$ vi api/config/config.exs # Edit configuration
```

Then start elasticsearch and do:

```
$ docker-compose up api

# or with iex: 

$ docker-compose run --service-ports --entrypoint "iex -S mix run --no-halt" api
```

Optionally, to index iDAI.field data from the CouchDB instance specified in api/config/config.exs, use: 

```
$ curl -XPOST localhost:4000/reindex
```

Now visit `localhost:4000/resources` or `localhost:4000/resources/f1`. It should display a list of sample
resources, as read in by put-test-data.sh into the elasticsearch.

## UI

For the frontend to start, first start the `API`, then do:

```
$ cd ui
$ npm install
$ npm run build
$ npm start
```

Now visit `localhost:3000`. You can search for example for `123` and get a hit.
