defmodule Utils do

  def atomize(map) do
    for {key, val} <- map, into: %{}, do: {String.to_atom(key),
      case val do
        [] -> []
        list = [_|_] -> for item <- list, into: [], do: atomize item
        map = %{} -> atomize map
        value -> value
      end
    }
  end

end