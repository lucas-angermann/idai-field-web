defmodule Api.Documents.MappingTest do
    import Api.Utils
    alias Api.Documents.Mapping
    use ExUnit.Case

    setup_all do
        result = File.read!("test/resources/elasticsearch_result.json")
            |> Poison.decode!
            |> atomize
        [result: result]
    end

    test "init", %{ result: result } do
        mapped = Mapping.map result
        assert mapped.size == result.hits.total.value
        #assert length(mapped.filter.type) == length(result.aggregations.type.buckets)
        #assert mapped.filter.type[0].value == result.aggregations.type.buckets[0].key
        #assert length(mapped.documents) == length(result.hits.hits)
        #assert mapped.documents[0].resource.identifer == result.hits.hits[0]._source.resource.identifier
    end

end
