defmodule Core.Utils do

  def atomize(%{} = map) do
    for {key, val} <- map, into: %{}, do: { String.to_atom(key), atomize val }
  end
  def atomize([_|_] = list), do: for item <- list, into: [], do: atomize item
  def atomize(v), do: v

  def atomize(%{} = map, only) do

    for {key, val} <- map, into: %{} do
      {
          if Enum.member?(only, String.to_atom(key)) do String.to_atom(key) else key end,
          atomize val
      }
    end
  end

  def atomize_excl(%{} = map, excl) do

    for {key, val} <- map, into: %{} do

      if Enum.member?(excl, String.to_atom(key)) do
        {
          key,
          val
        }
      else
        {
          String.to_atom(key),
          atomize_excl(val, excl)
        }
      end
    end
  end
  def atomize_excl(v, _excl), do: v
end