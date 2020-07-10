defmodule Core.CorePropertiesAtomizingTest do
  use ExUnit.Case, async: true
  use Plug.Test
  import Core.CorePropertiesAtomizing

  test "base  case" do

    result = format_document(%{ "resource" => %{ "category" => "Operation" }})
    assert result.resource.category == "Operation"
  end

  test "changes" do
    result = List.first(format_changes([%{ "changes" => 1, "doc" => %{ "resource" => %{ "category" => "Operation" }}}]))
    assert result.doc.resource.category == "Operation"
  end
end