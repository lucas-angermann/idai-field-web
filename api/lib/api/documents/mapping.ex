defmodule Api.Documents.Mapping do
  
  def map_single elasticsearch_result do
    elasticsearch_result
    |> get_in([:hits, :hits, Access.at(0), :_source])
    |> Core.CorePropertiesAtomizing.format_document
  end

  def map(elasticsearch_result) do
    %{
      size: elasticsearch_result.hits.total.value,
      documents: elasticsearch_result.hits.hits
                 |> Enum.map(&map_document/1)
    }
    |> map_aggregations(elasticsearch_result)
  end
  
  defp map_aggregations(result, %{ aggregations: aggregations }) do
    filters = Enum.map(Core.Config.get(:default_filters), map_aggregation(aggregations))
              |> Enum.reject(&is_nil/1)
    put_in(result, [:filters], filters)
  end
  defp map_aggregations(result, _), do: result

  defp map_aggregation(aggregations) do
    fn filter ->
      with agg when not is_nil(agg) <- get_in(
        aggregations,
        [String.to_atom(filter.field), :buckets]
      )
        do
          %{
            name: filter.field,
            label: filter.label,
            values: Enum.map(agg, fn bucket -> map_bucket(bucket, filter.field) end)
          }
        end
    end
  end

  defp map_bucket(%{ doc_count: doc_count, key: key, data: %{ hits: %{ hits: [hit|_] } } }, field_name) do
    %{
      value: %{
        name: key,
        label: get_label(hit._source["resource"][field_name], key)
      },
      count: doc_count
    }
  end
  
  defp map_document(%{ _source: document }) do
    document = Core.CorePropertiesAtomizing.format_document(document)
    put_in(document.resource.category, document.resource.category["name"])
  end

  defp get_label(field = [_|_], value), do: Enum.find(field, &(&1["name"] == value))["label"]
  defp get_label(field = %{}, _), do: field["label"]
  defp get_label(field, _), do: field
end
