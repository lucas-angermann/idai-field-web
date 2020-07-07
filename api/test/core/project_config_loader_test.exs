defmodule Core.ProjectConfigLoaderTest do
    use ExUnit.Case, async: true
    use Plug.Test

  test "load config for project" do
    config = Core.ProjectConfigLoader.load("test/resources", "test-project")
    assert List.first(config).item.label.de == "Maßnahme"
  end
end
