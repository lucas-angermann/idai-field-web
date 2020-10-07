defmodule Api.Documents.Index do
  require Logger
  alias Api.Documents.Mapping
  alias Api.Documents.Query
  alias Api.Documents.Filter
  alias Core.ProjectConfigLoader

  @max_geometries 10000
  @exists_geometries ["resource.geometry"]
  @fields_geometries ["resource.category", "resource.geometry", "resource.identifier", "resource.id", "project"]

  def get id do
    Query.init("_id:#{id}", 1)
    |> build_post_atomize
    |> Mapping.map_single
  end

  def search q, size, from, filters, must_not, exists, readable_projects do
    project_conf = ProjectConfigLoader.get("default")
    Query.init(q, size, from)
    |> Query.track_total
    |> Query.add_aggregations()
    |> Query.add_filters(filters |> Filter.parse |> Filter.expand(project_conf))
    |> Query.add_must_not(must_not |> Filter.parse |> Filter.expand(project_conf))
    |> Query.add_exists(exists)
    |> Query.set_readable_projects(readable_projects)
    |> build_post_atomize
    |> Mapping.map(project_conf)
  end

  def search_geometries q, filters, must_not, exists, readable_projects do
    project_conf = ProjectConfigLoader.get("default")
    Query.init(q, @max_geometries)
    |> Query.add_filters(filters |> Filter.parse |> Filter.expand(project_conf))
    |> Query.add_must_not(must_not |> Filter.parse |> Filter.expand(project_conf))
    |> Query.add_exists(exists)
    |> Query.add_exists(@exists_geometries)
    |> Query.only_fields(@fields_geometries)
    |> Query.set_readable_projects(readable_projects)
    |> build_post_atomize
    |> Mapping.map(project_conf)
  end

  defp build_post_atomize query do
    query
    |> Query.build
    |> index_adapter().post_query
    |> Core.Utils.atomize_up_to(:_source)
  end

  defp index_adapter do
    if Mix.env() == :test do
      Api.Documents.MockIndexAdapter
    else
      Api.Documents.ElasticsearchIndexAdapter
    end
  end
end
