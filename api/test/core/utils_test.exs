defmodule Core.UtilsTest do
  use ExUnit.Case

  test "abc" do
    assert Core.Utils.atomize(%{ "a" => "b" }) == %{ a: "b" }
  end
end