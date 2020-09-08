defmodule Core.LayoutTest do
    use ExUnit.Case, async: true
    use Plug.Test
    alias Core.Layout
    alias Core.ProjectConfigLoader

  test "map object" do

    resource = %{
        :category => "Operation",
        "color" => ["Grün", "Blau"],
        "width" => [%{ "inputValue" => 10, "inputUnit" => "cm", "measurementPosition" => "Maximale Ausdehnung" }],
        :id => "42",
        :relations => %{ "liesWithin" => ["45"]}
    }

    start_supervised({Core.ProjectConfigLoader, {"test/resources", ["test-project"]}})
    configuration = ProjectConfigLoader.get("test-project")

    layouted_resource = Layout.to_layouted_resource(configuration, resource)

    assert layouted_resource == %{
      :id => "42",
      :category => "Operation",
      :groups => [%{
        name: "stem",
        fields: [
           %{
            name: "category",
            value: "Operation",
            label: %{
              de: "Kategorie",
              en: "Category"
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
           },
           %{
              name: "color",
              value: [
                %{
                  name: "Grün",
                  label: %{
                    de: "Grün",
                    en: "Green"
                  }
                },
                %{
                  name: "Blau",
                  label: %{
                    de: "Blau",
                    en: "Blue"
                  }
                }
              ],
              label: %{
                de: "Farbe",
                en: "Color"
              },
              description: %{}
           }
        ],
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
             name: "width",
             value: [
               %{
                 inputValue: 10,
                 inputUnit: "cm",
                 measurementPosition: %{
                   name: "Maximale Ausdehnung",
                   label: %{
                     de: "Maximale Ausdehnung",
                     en: "Maximum expansion"
                   }
                 }
               }
             ],
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
