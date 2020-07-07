defmodule Core.Utils do


  def atomize(%{} = map, list, inclusive) do

    for {key, val} <- map, into: %{} do

      in_list = Enum.member?(list, String.to_atom(key))
      exclude_item = if inclusive do !in_list else in_list end

      if exclude_item do
        {
          key,
          val
        }
      else
        {
          String.to_atom(key),
          atomize(val, list, inclusive)
        }
      end
    end
  end
  def atomize([_|_] = list, l, invert), do: for item <- list, into: [], do: atomize(item, l, invert)
  def atomize(v, list), do: atomize(v, list, false)
  def atomize(v, _list, _invert), do: v
  def atomize(v), do: atomize(v, [], false)
end