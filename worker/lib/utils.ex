defmodule Utils do

  def atomize(%{} = map) do
    for {key, val} <- map, into: %{}, do: { String.to_atom(key), atomize val }
  end

  def atomize([_|_] = list), do: for item <- list, into: [], do: atomize item

  def atomize(v), do: v

end