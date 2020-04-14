# iDAI.field Web

## Getting started

```
$ docker-compose up
$ ./put-test-data.sh
$ cd api
$ mix deps.get
$ mix phx.server 
```

Now visit `localhost:4000/resources` or `localhost:4000/resources/f1`. It should display a list of sample
resources, as read in by put-test-data.sh into the elasticsearch.

