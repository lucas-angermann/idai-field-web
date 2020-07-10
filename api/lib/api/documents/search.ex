defmodule Api.Documents.Search do
  import Api.Documents.Helper
  alias Api.Documents.Mapping
  alias Api.Documents.Query

  @max_geometries 10000
  @fields_geometries ["resource.category", "resource.geometry", "resource.identifier", "resource.id"]

  def by(q, size, from, filters, must_not, exists) do
    Query.init(q, size, from)
    |> Query.track_total
    |> Query.add_aggregations()
    |> Query.add_filters(filters)
    |> Query.add_must_not(must_not)
    |> Query.add_exists(exists)
    |> Query.build
    |> post_query
  end

  def geometries_by(q, filters, must_not, exists) do
    Query.init(q, @max_geometries)
    |> Query.add_filters(filters)
    |> Query.add_must_not(must_not)
    |> Query.add_exists(exists)
    |> Query.only_fields(@fields_geometries)
    |> Query.show
    |> Query.build
    |> post_query
  end

  defp post_query(query) do
    HTTPoison.post("#{get_base_url()}/_search", query, [{"Content-Type", "application/json"}])
    |> handle_result
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    body
    |> Poison.decode!
    |> Core.Utils.atomize
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
