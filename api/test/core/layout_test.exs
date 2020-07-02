defmodule Core.LayoutTest do
    use ExUnit.Case, async: true
    use Plug.Test
    alias Core.Layout
    alias Core.ProjectConfigLoader

  test "map object" do
    doc = %{
        "resource" => %{
            "type" => "Operation",
            "width" => "1cm",
            "height" => "2cm",
            "id" => "42",
            "relations" => %{ "liesWithin" => ["45"]}
        }
    }

    configuration = ProjectConfigLoader.load("test/resources", "test-project", ["de", "en"])
    layouted_doc = Layout.to_layouted_document(doc, configuration)

    assert get_in(layouted_doc, ["resource", "id"]) == "42"
    assert get_in(layouted_doc, ["resource", "type"]) == "Operation"
    assert get_in(layouted_doc, ["resource", "width"]) == "1cm"
    assert get_in(layouted_doc, ["resource", "height"]) == "2cm"
    assert length(get_in(layouted_doc, ["resource", "groups"])) == 2

    assert get_in(layouted_doc, ["resource", "groups"]) ==
             [%{
                name: "stem",
                fields: [
                   %{
                    name: "type",
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
