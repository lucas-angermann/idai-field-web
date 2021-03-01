defmodule Api.Worker.Images.TilesController do

  alias Api.Worker.Images.TilesCreator

  def make_tiles(projects) do # TODO pass project, instead projects
    entries = projects
    |> Enum.flat_map(&tiles_for_project/1)
    Enum.map(entries, &TilesCreator.create_tiles/1)
    { :finished, List.first(projects) } # TODO review
  end

  defp tiles_for_project(project) do
    %{ documents: docs } = Api.Documents.Index.search(
      "*", 10000, 0, nil, nil, ["resource.georeference"], nil, nil, nil, [project]
    )
    Enum.map(docs, fn %{resource: %{ :id => id, "width" => width, "height" => height }} ->
      {project, id, {width, height}}
    end)
  end
end
