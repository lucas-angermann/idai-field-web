defmodule Worker.MapperTest do
    use ExUnit.Case, async: true
    use Plug.Test

  test "map object" do
    config = ProjectConfigLoader.load("test/resources", "test-project", ["de", "en"])
    doc = %{
        resource: %{
            "type" => "Operation",
            "width" => "1cm",
            "height" => "2cm",
            "id" => "42"
        }
    }
    layouted_doc = Layout.process(doc, config)
    IO.inspect layouted_doc
    assert get_in(layouted_doc.resource, ["id"]) == "42"
    assert length(get_in(layouted_doc.resource, ["groups"])) == 2
  end
end
