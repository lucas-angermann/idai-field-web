defmodule Api.UtilsTest do
  use ExUnit.Case

  test "abc" do
    assert Api.Utils.atomize(%{ "a" => "b" }) == %{ a: "b" }
  end
end