defmodule Enricher.LabelsTest do
  use ExUnit.Case, async: true
  use Plug.Test
  alias Enricher.Labels
  alias Core.ProjectConfigLoader
  alias Core.CategoryTreeList

  test "add labels" do

    change = %{
      :doc => %{
        :resource => %{
          :identifier => "ABC",
          :shortDescription => "Test resource",
          :category => "Operation",
          "color" => ["Grün", "Blau"],
          "width" => [%{ "inputValue" => 10, "inputUnit" => "cm", "measurementPosition" => "Maximale Ausdehnung" }],
          :id => "42",
          :relations => %{ "liesWithin" => ["45"] }
        }
      }
    }

    start_supervised({Core.ProjectConfigLoader, {"test/resources", ["test-project"]}})
    configuration = ProjectConfigLoader.get("test-project")
    category = CategoryTreeList.find_by_name(change.doc.resource.category, configuration)

    result = Labels.add_labels(change, category)

    assert result == %{
      :doc => %{
        :resource => %{
          id: "42",
          identifier: "ABC",
          shortDescription: "Test resource",
          category: %{ name: "Operation", label: %{ de: "Maßnahme", en: "Operation" } },
          color: [
            %{ name: "Grün", label: %{ de: "Grün", en: "Green" } },
            %{ name: "Blau", label: %{ de: "Blau", en: "Blue" } }
          ],
          width: [
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
          relations: %{ liesWithin: ["45"] }
        }
      }
    }
  end
end
