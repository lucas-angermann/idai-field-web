#!/bin/bash

curl -XPOST -H "Content-Type: application/json" -d @./data/samples/find1.json localhost:9200/idai-field/resource/f1
curl -XPOST -H "Content-Type: application/json" -d @./data/samples/find2.json localhost:9200/idai-field/resource/f2