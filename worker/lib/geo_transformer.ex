defmodule GeoTransformer do

  def from(changes, epsg) do
    {:ok, crs} = Proj.from_epsg(epsg)
    for change <- changes do transform_change change, crs end
  end


  defp transform_change(change = %{doc: %{resource: %{"geometry" => %{} = geometry}}}, crs) do
    put_in(change.doc.resource["geometry"]["coordinates"], to_lat_lng(geometry["coordinates"], crs))
  end

  defp transform_change(change, _crs), do: change


  defp to_lat_lng([], _crs), do: []

  defp to_lat_lng([x, y], crs) when is_number(x) and is_number(y) do
    Tuple.to_list(Proj.to_lat_lng!({x, y}, crs))
  end

  defp to_lat_lng([head|tail], crs) do
    [to_lat_lng(head, crs)|to_lat_lng(tail, crs)]
  end

end
