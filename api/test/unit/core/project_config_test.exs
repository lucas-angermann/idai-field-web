defmodule Core.ProjectConfigTest do
  use ExUnit.Case, async: true
  alias Core.ProjectConfig
  alias Core.ProjectConfigLoader

  test "get label" do
    start_supervised({ProjectConfigLoader, {"test/resources", ["test-project"]}})
    configuration = ProjectConfigLoader.get("test-project")

    label = ProjectConfig.get_label(configuration, "Operation", "category")
    assert label == %{ en: "Category", de: "Kategorie"}

    label = ProjectConfig.get_label(configuration, "Operation", "width")
    assert label == %{ en: "Width", de: "Breite"}
  end
end
