defmodule Utils do

  def atomize(map) do
    for {key, val} <- map, into: %{}, do: {String.to_atom(key), val}
  end

end