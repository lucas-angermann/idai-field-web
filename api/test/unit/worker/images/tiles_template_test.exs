defmodule Api.Worker.Images.TilesTemplateTest do
  use ExUnit.Case
  alias Api.Worker.Images.TilesTemplate

  test "500" do
    [first|[_second|_]] = TilesTemplate.create(500, 256)
    { {_, _}, layer_index } = first
    assert layer_index == 0
  end
end
