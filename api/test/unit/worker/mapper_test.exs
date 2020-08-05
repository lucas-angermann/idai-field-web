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
  
  test "convert old style period fields" do
    # todo implement and add assertion
  end
end