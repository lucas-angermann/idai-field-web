defmodule Core.Tree do


  def find_in_treelist(predicate, treelist) do

    result = Enum.find(treelist, fn %{ item: item } ->
      predicate.(item)
    end)

    if result == nil do
      nil
    else
      result.item
    end
  end
end