defmodule MapperTest do
  
  # todo rename Mapper to Worker.Mapper
  
  use ExUnit.Case
  use Plug.Test
  
  test "convert type to category" do
    change = %{ doc: %{ resource: %{ type: "abc" }}}
    %{ doc: %{ resource: resource }} = Mapper.process change
    
    assert resource[:type] == nil
    assert resource.category == "abc"
  end
  
  test "convert old style period field - period is string" do
    change = %{ doc: %{ resource: %{
      type: "abc",
      period: "start"
    }}}
    %{ doc: %{ resource: _resource }} = Mapper.process change

    # todo implement and add assertion
  end

  test "convert old style period field - period and periodEnd as strings" do
    change = %{ doc: %{ resource: %{
      type: "abc",
      period: "start",
      periodEnd: "end"
    }}}
    %{ doc: %{ resource: _resource }} = Mapper.process change
  
    # todo implement and add assertion
  end

  test "new style period field - leave unchanged" do
    change = %{ doc: %{ resource: %{
      type: "abc",
      period: %{
        # todo put something here
      }
    }}}
    %{ doc: %{ resource: _resource }} = Mapper.process change
  
    # todo implement and add assertion
  end
end