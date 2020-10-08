defmodule Api.EnvironmentTest do
  use ExUnit.Case, async: true
  use Plug.Test

  test "test imagemagick" do
    assert Worker.Images.ImageMagickTiling.environment_ready()
  end
end