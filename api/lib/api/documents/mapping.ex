defmodule Api.Documents.Mapping do

    def map(elasticsearch_result) do
        %{
            size: elasticsearch_result.hits.total.value,
            filters: elasticsearch_result.aggregations |> Enum.map(&map_aggregation/1) |> Enum.into(%{}),
            documents: elasticsearch_result.hits.hits |> Enum.map(&map_document/1)
        }
    end

    defp map_aggregation({key, %{ buckets: buckets }}) do
        {key, Enum.map(buckets, &map_bucket/1)}
    end

    defp map_bucket(%{ doc_count: doc_count, key: key }) do
        %{
            value: key,
            count: doc_count
        }
    end

    defp map_document(%{ _source: document }), do: document

end
