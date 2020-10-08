defmodule Worker.Images.TilesController do

  alias Core.Config
  alias Worker.Images.TilesCreator

  def make_tiles do
    projects = Config.get(:couchdb_databases)
    make_tiles(projects)
  end
  def make_tiles(projects) do
    entries = projects
    |> Enum.flat_map(&tiles_for_project/1)
    Enum.map(entries, &TilesCreator.create_tiles/1)
  end

  defp tiles_for_project(project) do
    %{ documents: docs } = Api.Documents.Index.search "*", 10, 0, nil, nil, ["resource.georeference"], [project]
    Enum.map(docs, fn %{resource: %{ :id => id, "width" => width, "height" => height }} ->
      {project, id, {width, height}}
    end)
  end
end