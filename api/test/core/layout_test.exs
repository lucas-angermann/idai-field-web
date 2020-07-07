defmodule Core.LayoutTest do
    use ExUnit.Case, async: true
    use Plug.Test
    alias Core.Layout
    alias Core.ProjectConfigLoader

  test "map object" do
      resource = %{
          :type => "Operation",
          "width" => "1cm",
          "height" => "2cm",
          :id => "42",
          :relations => %{ "liesWithin" => ["45"]}
      }

    configuration = ProjectConfigLoader.load("test/resources", "test-project")
    layouted_resource = Layout.to_layouted_resource(configuration).(resource)

    assert layouted_resource == %{
      :id => "42",
      :type => "Operation",
      :groups => [%{
        name: "stem",
        fields: [
           %{
            name: "type",
            value: "Operation",
            label: %{
              de: "Typ",
              en: "Type"
            },
            description: %{
              de: "Typ der Ressource",
              en: "Type of resource"
            }
           },
           %{
             name: "id",
             value: "42",
             label: %{},
             description: %{}
           }],
        relations: [
          %{
            name: "liesWithin",
            targets: ["45"],
            label: %{
              de: "Liegt in",
              en: "Lies within"
            },
            description: %{}
          }
        ]
       },
       %{
         name: "dimensions",
         fields: [
           %{
             name: "height",
             value: "2cm",
             label: %{
               de: "Höhe",
               en: "Height"
             },
             description: %{}
           },
           %{
             name: "width",
             value: "1cm",
             label: %{
               de: "Breite",
               en: "Width"
             },
             description: %{}
           }
         ],
         relations: []
       }
      ]
    }
  end
end
