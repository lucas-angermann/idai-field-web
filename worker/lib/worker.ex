defmodule Worker do

  def process do
    Harvester.fetch_changes()
    |> GeoTransformer.from(32638)
    |> Indexer.index
  end

end
