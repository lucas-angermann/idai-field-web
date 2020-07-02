defmodule Core.CategoryTreeList do

  def find_by_name(target_name, category_treelist) do
    Core.Tree.find_in_treelist(
      fn %{ "name" => name } -> target_name == name end,
      category_treelist
    )
  end
end