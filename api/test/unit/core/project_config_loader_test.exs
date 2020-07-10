defmodule Core.ProjectConfigLoaderTest do
    use ExUnit.Case, async: true
    use Plug.Test

  test "load config for project" do
    start_supervised({Core.ProjectConfigLoader, {"test/resources", ["test-project"]}})
    config = Core.ProjectConfigLoader.get("test-project")
    assert List.first(config).item.label.de == "Maßnahme"
  end
end
