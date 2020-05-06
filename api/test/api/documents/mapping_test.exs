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

        assert length(mapped.filters.type) == length(result.aggregations.type.buckets)        
        mapped_key = get_in(mapped.filters.type, [Access.at(0), :value])
        original_key = get_in(result.aggregations.type.buckets, [Access.at(0), :key])
        assert mapped_key == original_key

        assert length(mapped.documents) == length(result.hits.hits)
        mapped_identifier = get_in(mapped.documents, [Access.at(0), :resource, :identifier])
        original_key = get_in(result.hits.hits, [Access.at(0), :_source, :resource, :identifier])
        assert mapped_identifier == original_key
    end

end
