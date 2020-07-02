defmodule Core.LayoutTest do
    use ExUnit.Case, async: true
    use Plug.Test
    alias Core.Layout

  test "map object" do
    doc = %{
        resource: %{
            "type" => "Operation",
            "width" => "1cm",
            "height" => "2cm",
            "id" => "42"
        }
    }

    %{ "de" => [%{ "item" => category_conf } | _] } = ProjectConfigLoader.load("test/resources", "test-project", ["de", "en"])
    # TODO category = Treelist.get_by_predicate -> get_by_by_category_name

    layouted_doc = Layout.get_layout(doc, category_conf)
    #IO.inspect layouted_doc
    assert get_in(layouted_doc.resource, ["id"]) == "42"
    assert get_in(layouted_doc.resource, ["type"]) == "Operation"
    assert get_in(layouted_doc.resource, ["width"]) == "1cm"
    assert get_in(layouted_doc.resource, ["height"]) == "2cm"
    assert length(get_in(layouted_doc.resource, ["groups"])) == 2

    assert length(get_in(layouted_doc.resource, ["groups", Access.at(0), :fields])) == 2
    assert length(get_in(layouted_doc.resource, ["groups", Access.at(1), :fields])) == 2
  end
end
