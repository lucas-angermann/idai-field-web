defmodule Worker.Services.Tiles do

  # alias Worker.Services.TilesCreator # todo use

  @tile_size 256

  # size = 6000
  # project = "wes"
  # image_id = "6c5f936b-dba9-bf57-b681-5fc292e00e0b"
  # todo it is necessary for indexing to run before tile generation
  def trigger_tile_calculation() do
    %{ documents: docs } = Api.Documents.Index.search "*", 10, 0, [], [], ["resource.georeference"], ["wes"]
    entries = Enum.map(docs, fn %{resource: %{ :id => id, "width" => width, "height" => height }} -> {id, width, height} end)
    IO.inspect entries
    nil
  end
end