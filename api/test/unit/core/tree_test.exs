defmodule Core.TreeTest do
  use ExUnit.Case
  use Plug.Test
  alias Core.Tree

  test "find_in_tree_list" do
    tree_list = [
      %{
        item: 5,
        trees: []
      },
      %{
        item: 3,
        trees: []
      }
    ]

    result = Tree.find_in_tree_list(fn x -> x == 3 end, tree_list)
    assert result == 3
  end

  test "find_in_tree_list - recursive" do
    tree_list = [
      %{
        item: 5,
        trees: [
          %{
            item: 4,
            trees: []
          },
          %{
            item: 3,
            trees: []
          }
        ]
      }
    ]

    result = Tree.find_in_tree_list(fn x -> x == 3 end, tree_list)
    assert result == 3
  end

  test "find_in_tree_list - return nil if not found" do

    tree_list = [
      %{
        item: 1,
        trees: []
      },
      %{
        item: 2,
        trees: []
      }
    ]

    result = Tree.find_in_tree_list(fn x -> x == 3 end, tree_list)
    assert result == nil
  end
end
