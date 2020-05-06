defmodule Api.Documents.Search do
  import Api.Documents.Helper
  alias Api.Documents.Mapping

  def by(q, size, from) do
    q = if !q do "*" else q end
    size = if !size do 100 else size end
    from = if !from do 0 else from end
    handle_result HTTPoison.post(
      "#{get_base_url()}/_search",
      build_query(q, size, from),
      [{"Content-Type", "application/json"}]
    )
  end

  defp build_query(q, size, from) do
    %{
      query: %{
        query_string: %{
          query: q
        },
      },
      size: size,
      from: from,
      aggs: build_aggregations(),
      track_total_hits: true
    } |> Poison.encode!
  end

  defp build_aggregations() do
    %{
      type: %{
        terms: %{
          field: "resource.type"
        }
      }
    }
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
