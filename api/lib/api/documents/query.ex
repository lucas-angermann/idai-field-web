defmodule Api.Documents.Query do

  def build(q, size, from, filters, must_not) do
    build_query_template(q, size, from)
    |> add_aggregations
    |> add_filters(filters)
    |> add_must_not(must_not)
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
          }
        }
      },
      size: size,
      from: from,
      track_total_hits: true
    }
  end

  defp add_filters(query, nil), do: query
  defp add_filters(query, filters) do
    put_in(query[:query][:bool][:filter], Enum.map(filters, &build_term_query/1))
  end

  defp add_must_not(query, nil), do: query
  defp add_must_not(query, must_not) do
    put_in(query[:query][:bool][:must_not], Enum.map(must_not, &build_term_query/1))
  end

  defp build_term_query(fieldAndValue) do
    [field, value] = String.split(fieldAndValue, ":")
    %{ term: %{ field => value }}
  end

  defp add_aggregations(query) do
    Map.put(query, :aggs, %{
      type: %{
        terms: %{ field: "resource.type" }
      },
      material: %{
        terms: %{ field: "resource.material" }
      },
      color: %{
        terms: %{ field: "resource.color" }
      }
    })
  end
end
