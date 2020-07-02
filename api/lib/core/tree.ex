defmodule Core.Tree do

  def find_in_treelist(predicate, treelist) do

    result = Enum.find(treelist, fn %{ "item" => item } ->
      predicate.(item)
    end)

    if result == nil do
      all_children = Enum.map(treelist, fn %{ "trees" => trees } -> trees end)
      find_in_treelist(predicate, List.flatten(all_children))
    else
      result["item"]
    end
  end
end