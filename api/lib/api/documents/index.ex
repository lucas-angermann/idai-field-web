defmodule Api.Documents.Index do
  require Logger
  alias Api.Documents.Mapping
  alias Api.Documents.Query

  @max_geometries 10000
  @exists_geometries ["resource.geometry"]
  @fields_geometries ["resource.category", "resource.geometry", "resource.identifier", "resource.id", "project"]

  def get id do
    Query.init("_id:#{id}", 1)
    |> Query.build
    |> index_adapter().post_query
    |> get_in(["hits", "hits", Access.at(0), "_source"])
    |> Core.CorePropertiesAtomizing.format_document
  end

  def search q, size, from, filters, must_not, exists, readable_projects do
    Query.init(q, size, from)
    |> Query.track_total
    |> Query.add_aggregations()
    |> Query.add_filters(filters)
    |> Query.add_must_not(must_not)
    |> Query.add_exists(exists)
    |> Query.set_readable_projects(readable_projects)
    |> Query.build
    |> index_adapter().post_query
    |> Core.Utils.atomize # todo review; we do not want to atomize the complete documents (compare to format_document)
    |> Mapping.map
  end

  def search_geometries q, filters, must_not, exists do
    Query.init(q, @max_geometries)
    |> Query.add_filters(filters)
    |> Query.add_must_not(must_not)
    |> Query.add_exists(exists)
    |> Query.add_exists(@exists_geometries)
    |> Query.only_fields(@fields_geometries)
    |> Query.build
    |> Api.Documents.ElasticsearchIndexAdapter.post_query
    |> Core.Utils.atomize
    |> Mapping.map
  end

  defp index_adapter do
    if Mix.env() == :test do # todo write more concise
      Api.Documents.MockIndexAdapter
    else
      Api.Documents.ElasticsearchIndexAdapter
    end
  end
end
