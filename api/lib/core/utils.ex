defmodule Core.Utils do

#  def atomize([_|_] = list), do: for item <- list, into: [], do: atomize item

  def atomize(%{} = map, list, invert) do

    for {key, val} <- map, into: %{} do

      in_list = Enum.member?(list, String.to_atom(key))
      exclude_item = if invert do !in_list else in_list end
      IO.puts "#{key} #{exclude_item}"

      if exclude_item do
        {
          key,
          val
        }
      else
        {
          String.to_atom(key),
          atomize(val, list, invert)
        }
      end
    end
  end
  def atomize(%{} = map), do: atomize(map, [], false)
  def atomize(v), do: v
  def atomize(v, list), do: atomize(v, list, false)
  def atomize(v, _list, _invert), do: atomize(v)
end