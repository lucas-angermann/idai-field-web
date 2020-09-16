defmodule Core.Tree do

  def find_in_tree_list(predicate, tree_list) do
    result = Enum.find(tree_list, fn %{ item: item } ->
      predicate.(item)
    end)

    if result == nil do
      find_in_children(predicate, tree_list)
    else
      result.item
    end
  end

  defp find_in_children(predicate, tree_list) do
    all_children = Enum.map(tree_list, fn %{ trees: trees } -> trees end)
    if Enum.count(all_children) > 0 do
      find_in_tree_list(predicate, List.flatten(all_children))
    else
      nil
    end
  end

end
