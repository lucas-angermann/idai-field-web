defmodule Api.Documents.FilterTest do
  import Core.Utils
  alias Api.Documents.Filter
  alias Core.ProjectConfigLoader
  use ExUnit.Case

  test "expand" do
    start_supervised({ProjectConfigLoader, {"resources/projects", ["default"]}})
    conf = ProjectConfigLoader.get("default")

    filters = [
      {"resource.category.name", "Find"},
      {"resource.category.name", "Layer"},
      {"project", "test"}
    ]

    expanded_filters = Filter.expand(filters, conf)
    expanded_categories = for {"resource.category.name", c} <- expanded_filters, do: c

    subcategories = Enum.find(conf, &(&1.item.name == "Find"))
      |> (fn find -> Enum.map(find.trees, &(&1.item.name)) end).()

    assert Enum.all?(subcategories, &(&1 in expanded_categories))

  end
end
