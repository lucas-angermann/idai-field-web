defmodule Core.Utils do

  def atomize(%{} = map, list, inclusive) do

    for {key, val} <- map, into: %{} do

      key_as_atom = if not is_atom(key) do String.to_atom(key) else key end
      in_list = Enum.member?(list, key_as_atom)
      exclude_item = if inclusive do !in_list else in_list end

      if exclude_item do
        {
          key,
          val
        }
      else
        {
          key_as_atom,
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