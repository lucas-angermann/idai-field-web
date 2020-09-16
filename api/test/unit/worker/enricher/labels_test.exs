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
          "material" => ["Eisen"],
          "width" => [%{ "inputValue" => 10, "inputUnit" => "cm", "measurementPosition" => "Maximale Ausdehnung" }],
          :id => "42",
          :relations => %{ "liesWithin" => ["45"] }
        }
      }
    }

    start_supervised({Core.ProjectConfigLoader, {"test/resources", ["test-project"]}})
    configuration = ProjectConfigLoader.get("test-project")

    result = Labels.add_labels(change, configuration)

    assert result == %{
      :doc => %{
        :resource => %{
          id: "42",
          identifier: "ABC",
          shortDescription: "Test resource",
          category: %{ name: "Operation", label: %{ de: "Maßnahme", en: "Operation" } },
          color: [
            %{ name: "Grün", label: %{} }, # Value definition found, but does not include label
            %{ name: "Blau", label: %{ de: "Blau", en: "Blue" } } # Value definition with label found
          ],
          material: [
            %{ name: "Eisen", label: %{} } # No value definition found
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
