defmodule Api.Documents.Query do

  def build(q, size, from, filters, must_not, exists) do
    build_query_template(q, size, from)
    |> add_aggregations
    |> add_filters(filters)
    |> add_must_not(must_not)
    |> add_exists(exists)
    |> Poison.encode!
  end

  defp build_query_template(q, size, from) do
    %{
      query: %{
        bool: %{
          must: %{
            query_string: %{
              query: q
            }
          },
          filter: [],
          must_not: []
        }
      },
      size: size,
      from: from,
      track_total_hits: true
    }
  end

  defp add_filters(query, nil), do: query
  defp add_filters(query, filters) do
    filter = Enum.map(filters, &build_term_query/1)
    update_in(query[:query][:bool][:filter], &(&1 ++ filter))
  end

  defp add_must_not(query, nil), do: query
  defp add_must_not(query, must_not) do
    put_in(query[:query][:bool][:must_not], Enum.map(must_not, &build_term_query/1))
  end

  defp add_exists(query, nil), do: query
  defp add_exists(query, exists) do
    exists_filter = Enum.map(exists, &build_exists_query/1)
    update_in(query[:query][:bool][:filter], &(&1 ++ exists_filter))
  end

  defp build_term_query(fieldAndValue) do
    [field, value] = String.split(fieldAndValue, ":")
    %{ term: %{ field => value }}
  end

  defp build_exists_query(field) do
    %{ exists: %{ field: field } }
  end

  defp add_aggregations(query) do
    Map.put(query, :aggs, %{
      "resource.type" => %{
        terms: %{ field: "resource.type" }
      },
      "resource.material" => %{
        terms: %{ field: "resource.material" }
      },
      "resource.color" => %{
        terms: %{ field: "resource.color" }
      }
    })
  end
end
