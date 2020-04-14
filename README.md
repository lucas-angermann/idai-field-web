# iDAI.field Web

## Getting started

```
$ docker-compose up
$ ./put-test-data.sh # verify at http://localhost:9200/idai-field/resource/_search
$ cd api
$ mix deps.get
$ mix phx.server 
```

Now visit `localhost:4000/api/resources` or `localhost:4000/api/resource/f1`. It should display a list of sample resources,
as read in by put-test-data.sh into the elasticsearch.

