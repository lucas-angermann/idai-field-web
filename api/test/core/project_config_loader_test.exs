defmodule Core.ProjectConfigLoaderTest do
    use ExUnit.Case, async: true
    use Plug.Test

  test "load config for project" do
    config = Core.ProjectConfigLoader.load("test/resources", "test-project")
    assert get_in(config, [Access.at(0), "item", "label", "de"]) == "Maßnahme"
  end
end
