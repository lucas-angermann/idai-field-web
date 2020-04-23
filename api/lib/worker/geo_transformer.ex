defmodule GeoTransformer do

  def from(changes, epsg) do
    {:ok, crs} = Proj.from_epsg(epsg)
    for change <- changes do transform_change change, crs end
  end


  defp transform_change(change = %{doc: %{resource: %{"geometry" => %{} = geometry}}}, crs) do
    put_in(change.doc.resource["geometry"]["coordinates"], to_lng_lat(geometry["coordinates"], crs))
  end

  defp transform_change(change, _crs), do: change


  defp to_lng_lat([], _crs), do: []

  defp to_lng_lat([x, y], crs) when is_number(x) and is_number(y) do
    {lat, lng} = (Proj.to_lat_lng!({x, y}, crs))
    [lng, lat]
  end

  defp to_lng_lat([head|tail], crs) do
    [to_lng_lat(head, crs)|to_lng_lat(tail, crs)]
  end

end
