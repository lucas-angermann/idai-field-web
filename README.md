# iDAI.field Web

## Getting started

## API
```
$ docker-compose up
$ ./put-test-data.sh
$ cd api
$ mix deps.get
$ mix run --no-halt
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
