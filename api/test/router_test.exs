defmodule Api.RouterTest do
  use ExUnit.Case, async: true
  use Plug.Test

  @opts Api.Router.init([])

  # replace by a better test
  test "initial test" do
    conn = conn(:get, "/test")

    conn = Api.Router.call(conn, @opts)

    assert conn.state == :sent
    assert conn.status == 200
    assert Poison.decode!(conn.resp_body) == %{ "status" => "ok!" }
  end
end