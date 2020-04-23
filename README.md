# iDAI.field Web

## Getting started

## Data

To set up test data, and provide them via elasticsearch, do:

```
$ docker-compose up elasticsearch
$ ./put-test-data.sh
```

Test via `http://localhost:9200/idai-field/_search`.

## Worker

To index iDAI.field data from a CouchDB instance, do:

```
$ mv worker/config/config.exs.template worker/config/config.exs
$ vi worker/config/config.exs # Edit configuration
$ docker-compose run --entrypoint "iex -S mix" api
iex> Worker.process()
```

## API

Start elasticsearch and then do:

```
$ docker-compose up api
```

Now visit `localhost:4000/resources` or `localhost:4000/resources/f1`. It should display a list of sample
resources, as read in by put-test-data.sh into the elasticsearch.

You can also do `$ iex -S mix`, which will allow to recompile everything via `iex(1)> recompile()`. Requests to 
the server are possible immediately after recompilation, while staying in the repl. 

## UI

For the frontend to start, first start the `API`, then do:

```
$ cd ui
$ npm install
$ npm run build
$ npm start
```

Now visit `localhost:3000`. You can search for example for `123` and get a hit.
