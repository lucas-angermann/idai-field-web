defmodule Worker.Services.Tiles do

  alias Core.Config
  alias Worker.Services.TilesCreator

  # todo it is necessary for indexing to run before tile generation
  def trigger_tile_calculation() do
    projects = Config.get(:couchdb_databases)
    entries = Enum.flat_map(projects, &tiles_for_project/1)
    Enum.map(entries, &TilesCreator.create_tiles/1)
  end

  defp tiles_for_project(project) do
    %{ documents: docs } = Api.Documents.Index.search "*", 10, 0, [], [], ["resource.georeference"], [project]
    entries = Enum.map(docs, fn %{resource: %{ :id => id, "width" => width, "height" => height }} ->
      {project, id, {width, height}}
    end)
  end
end