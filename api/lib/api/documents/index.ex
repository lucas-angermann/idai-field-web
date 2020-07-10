defmodule Api.Documents.Index do
  alias Api.Documents.Mapping
  alias Api.Documents.Query
  alias Core.ProjectConfigLoader
  import Core.Layout

  @max_geometries 10000
  @exists_geometries ["resource.geometry"]
  @fields_geometries ["resource.category", "resource.geometry", "resource.identifier", "resource.id"]

  def get(id) do
    handle_get_result HTTPoison.get("#{get_base_url()}/_doc/#{id}")
  end

  def search(q, size, from, filters, must_not, exists) do
    Query.init(q, size, from)
    |> Query.track_total
    |> Query.add_aggregations()
    |> Query.add_filters(filters)
    |> Query.add_must_not(must_not)
    |> Query.add_exists(exists)
    |> Query.build
    |> post_query
  end

  def search_geometries(q, filters, must_not, exists) do
    Query.init(q, @max_geometries)
    |> Query.add_filters(filters)
    |> Query.add_must_not(must_not)
    |> Query.add_exists(exists)
    |> Query.add_exists(@exists_geometries)
    |> Query.only_fields(@fields_geometries)
    |> Query.build
    |> post_query
  end

  defp get_base_url do
    "#{Application.fetch_env!(:api, :elasticsearch_url)}/#{Application.fetch_env!(:api, :elasticsearch_index)}"
  end

  defp post_query(query) do
    HTTPoison.post("#{get_base_url()}/_search", query, [{"Content-Type", "application/json"}])
    |> handle_result
  end

  defp handle_get_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    document = body
    |> Poison.decode!
    |> get_in(["_source"])
    |> Core.CorePropertiesAtomizing.format_document

    project_config = ProjectConfigLoader.get(document.project)
    update_in(document, [:resource], to_layouted_resource(project_config))
  end

  defp handle_get_result({:ok, %HTTPoison.Response{status_code: 404}}) do
    %{error: "not_found"}
  end

  defp handle_get_result({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    %{error: "unknown"}
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
