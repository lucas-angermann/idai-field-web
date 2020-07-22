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
  
  defp map_aggregations(result, %{aggregations: aggregations}) do
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
          values: Enum.map(agg, &map_bucket/1)
        }
      end
    end
  end
  
  defp map_bucket(%{doc_count: doc_count, key: key}) do
    %{
      value: key,
      count: doc_count
    }
  end
  
  defp map_document(%{_source: document}), do: document
end
