defmodule Core.CorePropertiesAtomizingTest do
  use ExUnit.Case, async: true
  use Plug.Test
  import Core.CorePropertiesAtomizing

  test "base  case" do

    result = format_document(%{ "resource" => %{ "type" => "Operation" }})
    assert result.resource.type == "Operation"
  end

  test "changes" do
    result = List.first(format_changes([%{ "changes" => 1, "doc" => %{ "resource" => %{ "type" => "Operation" }}}]))
    assert result.doc.resource.type == "Operation"
  end
end