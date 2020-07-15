defmodule Api.Documents.Mapping do

    def map(elasticsearch_result) do
        %{
            size: elasticsearch_result.hits.total.value,
            documents: elasticsearch_result.hits.hits |> Enum.map(&map_document/1)
        }
        |> map_aggregations(elasticsearch_result)
    end

    defp map_aggregations(result, %{ aggregations: aggregations }) do
        with {:ok, default_filters} = Application.fetch_env(:api, :default_filters),
        do: put_in(result, [:filters], Enum.zip(aggregations, default_filters) |> Enum.map(&map_aggregation/1))
    end
    defp map_aggregations(result, _), do: result

    defp map_aggregation({{key, %{ buckets: buckets }}, %{ label: label }}) do
        %{
            name: key,
            values: Enum.map(buckets, &map_bucket/1),
            label: label
        }
    end

    defp map_bucket(%{ doc_count: doc_count, key: key }) do
        %{
            value: key,
            count: doc_count
        }
    end

    defp map_document(%{ _source: document }), do: document

end
