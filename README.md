# iDAI.field Web

## Getting started

```
$ docker-compose up
$ ./put-test-data.sh
$ cd api
$ mix deps.get
$ mix run --no-halt
$ cd ..
```

Now visit `localhost:4000/resources` or `localhost:4000/resources/f1`. It should display a list of sample
resources, as read in by put-test-data.sh into the elasticsearch.

For the frontend to start, do:

```
$ cd ui
$ npm install
$ npm run build
$ npm start
$ cd ..
```

Now visit `localhost:3000`. You can search for example for `123` and get a hit.
