#!/bin/bash

curl -XPOST -H "Content-Type: application/x-ndjson" --data-binary @data/samples/bulk.jsonl localhost:9200/idai-field/_bulk
