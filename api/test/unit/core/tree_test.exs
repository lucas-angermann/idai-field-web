defmodule Core.TreeTest do
  use ExUnit.Case
  use Plug.Test
  alias Core.Tree

  test "find_in_treelist" do
    treelist = [
      %{
        item: 5,
        trees: []
      },
      %{
        item: 3,
        trees: []
      }
    ]

    result = Tree.find_in_treelist(fn x -> x == 3 end, treelist)
    assert result == 3
  end

  test "find_in_treelist - recursive" do
    treelist = [
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

    result = Tree.find_in_treelist(fn x -> x == 3 end, treelist)
    assert result == 3
  end

  test "find_in_treelist - return nil if not found" do

    treelist = [
      %{
        item: 1,
        trees: []
      },
      %{
        item: 2,
        trees: []
      }
    ]

    result = Tree.find_in_treelist(fn x -> x == 3 end, treelist)
    assert result == nil
  end
end
