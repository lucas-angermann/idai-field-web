defmodule Api.Documents.Search do
  import Api.Documents.Helper
  alias Api.Documents.Mapping

  def by(q, size, from, filters, must_not) do
    q = if !q do "*" else q end
    size = if !size do 100 else size end
    from = if !from do 0 else from end
    handle_result HTTPoison.post(
      "#{get_base_url()}/_search",
      build_query(q, size, from, filters, must_not),
      [{"Content-Type", "application/json"}]
    )
  end

  defp build_query(q, size, from, filters, must_not) do
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
        terms: %{
          field: "resource.type"
        }
      }
    })
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    body
    |> to_atomized_result
    |> Mapping.map
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 400, body: body}}) do
    IO.inspect body
    %{error: "bad_request"}
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    %{error: "unknown"}
  end
end
