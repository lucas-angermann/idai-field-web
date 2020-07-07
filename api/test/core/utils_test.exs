defmodule Core.UtilsTest do
  use ExUnit.Case

  test "abc" do
    assert Core.Utils.atomize(%{ "a" => "b" }) == %{ a: "b" }
  end

  test "only atomize certain keys, let others untouched" do
    result = Core.Utils.atomize(%{ "a" => "b", "c" => "d" }, [:a])
    assert result == %{ :a => "b", "c" => "d" }
    assert result.a == "b"
  end

  test "exclusions" do
    result = Core.Utils.atomize_excl(%{ "a" => "b", "c" => "d" }, [:c])
    assert result == %{ :a => "b", "c" => "d" }
    assert result.a == "b"
  end

  test "exclusions - recursive case" do
    result = Core.Utils.atomize_excl(%{ "a" => %{ "c" => "d", "b" => "m" }}, [:c])
    assert result == %{ :a => %{ "c" => "d", :b => "m" } }
    assert result.a.b == "m"
  end
end