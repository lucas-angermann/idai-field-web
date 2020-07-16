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

  test "get document" do
    conn = conn(:get, "/documents/doc-of-proj-a")
    conn = Api.Router.call(conn, @opts)
    doc = Core.Utils.atomize(Poison.decode!(conn.resp_body))
    assert doc.project == "a"
  end

  test "do not get document as anonymous user" do
    conn = conn(:get, "/documents/doc-of-proj-b")
    conn = Api.Router.call(conn, @opts)
    doc = Core.Utils.atomize(Poison.decode!(conn.resp_body))

    # TODO assert unauthorized access
  end

  test "get document as logged in user" do
    token = sign_in "user-1", "pass-1"
    conn = conn(:get, "/documents/doc-of-proj-b")
           |> put_req_header("authorization", token)
           |> Api.Router.call(@opts)
    doc = Core.Utils.atomize(Poison.decode!(conn.resp_body))
    assert doc.project == "b"
  end

  test "show rights" do

    token = sign_in "user-1", "pass-1"
    readable_projects = show_rights token
    assert readable_projects == ["a", "b", "c", "d"]

    token = sign_in "user-2", "pass-2"
    readable_projects = show_rights token
    assert readable_projects == ["a", "b", "c"]

    token = sign_in "user-3", "pass-3"
    readable_projects = show_rights token
    assert readable_projects == ["a", "b"]
  end

  defp sign_in name, pass do
    conn = conn(:post, "/auth/sign_in", %{ name: name, pass: pass })
      |> Api.Router.call(@opts)
    Poison.decode!(conn.resp_body)["token"]
  end

  defp show_rights token do
    conn = conn(:get, "/auth/show")
      |> put_req_header("authorization", token)
      |> Api.Router.call(@opts)

    Core.Utils.atomize(Poison.decode!(conn.resp_body)).rights.readable_projects
  end
end