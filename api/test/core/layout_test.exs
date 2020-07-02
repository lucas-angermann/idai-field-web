defmodule Core.LayoutTest do
    use ExUnit.Case, async: true
    use Plug.Test
    alias Core.Layout

  test "map object" do
    doc = %{
        resource: %{
            "category" => "Operation",
            "width" => "1cm",
            "height" => "2cm",
            "id" => "42",
            "relations" => %{ "liesWithin" => ["45"]}
        }
    }

    %{ "de" => language_conf } = ProjectConfigLoader.load("test/resources", "test-project", ["de", "en"])
    category_conf = Core.CategoryTreeList.find_by_name("Operation", language_conf)

    layouted_doc = Layout.get_layout(doc, category_conf)
    #IO.inspect layouted_doc
    assert get_in(layouted_doc.resource, ["id"]) == "42"
    assert get_in(layouted_doc.resource, ["category"]) == "Operation"
    assert get_in(layouted_doc.resource, ["width"]) == "1cm"
    assert get_in(layouted_doc.resource, ["height"]) == "2cm"
    assert length(get_in(layouted_doc.resource, ["groups"])) == 2

    assert length(get_in(layouted_doc.resource, ["groups", Access.at(0), :fields])) == 2
    assert length(get_in(layouted_doc.resource, ["groups", Access.at(1), :fields])) == 2

    assert get_in(layouted_doc.resource, ["groups"]) ==
             [%{
                name: "stem",
                fields: [
                   %{
                    name: "category",
                    value: "Operation"
                   },
                   %{
                     name: "id",
                     value: "42"
                   }],
                relations: [
                  %{
                    name: "liesWithin",
                    targets: ["45"]
                  }
                ]
               },
               %{
                 name: "dimensions",
                 fields: [
                   %{
                     name: "height",
                     value: "2cm"
                   },
                   %{
                     name: "width",
                     value: "1cm"
                   }
                 ],
                 relations: []
               }
              ]
  end
end
