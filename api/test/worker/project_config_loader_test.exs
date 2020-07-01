defmodule Api.ProjectConfigLoaderTest do
    use ExUnit.Case, async: true
    use Plug.Test

  test "load config for project and locale" do
    config = ProjectConfigLoader.load("test/resources", "test-project", ["de", "en"])
    assert get_in(config, ["de", Access.at(0), "item", "label"]) == "Maßnahme"
    assert get_in(config, ["en", Access.at(0), "item", "label"]) == "Operation"
  end
end
