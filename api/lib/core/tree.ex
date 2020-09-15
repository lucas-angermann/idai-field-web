defmodule Core.Tree do

  def find_in_treelist(predicate, treelist) do
    result = Enum.find(treelist, fn %{ item: item } ->
      predicate.(item)
    end)

    if result == nil do
      find_in_children(predicate, treelist)
    else
      result.item
    end
  end

  defp find_in_children(predicate, treelist) do
    all_children = Enum.map(treelist, fn %{ trees: trees } -> trees end)
    if Enum.count(all_children) > 0 do
      find_in_treelist(predicate, List.flatten(all_children))
    else
      nil
    end
  end

end
