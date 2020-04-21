defmodule Worker do
  @moduledoc """
  Documentation for `Worker`.
  """

  def process do
    %{"results" => results} = Harvester.fetch_all_documents()
    Indexer.index results
  end

  def convert_coordinates(epsg, x, y) do
    {:ok, crs} = Proj.from_epsg(epsg)
    Proj.to_lat_lng!({x, y}, crs)
  end
end
