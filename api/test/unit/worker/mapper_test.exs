defmodule Api.Worker.MapperTest do
  
  alias Api.Worker.Mapper
  
  use ExUnit.Case
  use Plug.Test
  
  test "convert type to category" do
    change = %{ doc: %{ resource: %{ type: "abc" }}}
    %{ doc: %{ resource: resource }} = Mapper.process(change, "test-project")
    
    assert resource[:type] == nil
    assert resource.category == "abc"
  end

  test "convert Project category document" do
    change = %{ id: "?", doc: %{ resource: %{
      type: "Project",
      identifier: "Proj-A",
      id: "id-A"
    }}}
    %{id: change_id, doc: %{ resource: resource }} = Mapper.process(change, "Proj-A")
    
    assert resource.category == "Project"
    assert resource.id == "Proj-A"
    assert change_id == "Proj-A"
  end

  test "leave deletion unchanged" do
    change = %{ deleted: true }
    result = Mapper.process(change, "Test project")
  
    assert result == %{ deleted: true }
  end
  
  test "convert old style period field - period is string" do
    change = %{ doc: %{ resource: %{
      :type => "abc",
      "period" => "start"
    }}}
    %{ doc: %{ resource: resource }} = Mapper.process(change, "test-project")

    assert resource["period"] == %{ "value" => "start" }
  end

  test "convert old style period field - period and periodEnd as strings" do
    change = %{ doc: %{ resource: %{
      :type => "abc",
      "period" => "start",
      "periodEnd" => "end"
    }}}
    %{ doc: %{ resource: resource }} = Mapper.process(change, "test-project")

    assert resource["periodEnd"] == nil
    assert resource["period"] == %{ "value" => "start", "endValue" => "end" }
  end

  test "new style period field - leave unchanged" do
    change = %{ doc: %{ resource: %{
      :type => "abc",
      "period" => %{
        "value" => "start",
        "endValue" => "end"
      }
    }}}
    %{ doc: %{ resource: resource }} = Mapper.process(change, "test-project")

    assert resource["period"] == %{ "value" => "start", "endValue" => "end" }
  end

  test "replace project id with identifier in relation targets" do
    change = %{ doc: %{ resource: %{
      :type => "abc",
      :relations => %{
        "depicts" => ["123", "project", "456"],
        "isMapLayerOf" => ["project"]
      }
     }}}
     %{ doc: %{ resource: resource }} = Mapper.process(change, "test-project")

     assert resource[:relations] == %{
      "depicts" => ["123", "test-project", "456"],
      "isMapLayerOf" => ["test-project"]
    }
  end
end