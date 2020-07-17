defmodule Api.RouterTest do
  use ExUnit.Case, async: true
  use Plug.Test

  @opts Api.Router.init([])

  test "show rights" do
    assert show_rights("user-1", "pass-1") == ["a", "b", "c", "d"]
    assert show_rights("user-2", "pass-2") == ["a", "b", "c"]
    assert show_rights("user-3", "pass-3") == ["a", "b"]
  end

  test "get document" do
    {conn, doc} = get_doc "doc-of-proj-a"

    assert conn.state == :sent
    assert conn.status == 200
    assert doc.project == "a"
  end

  test "do not get document as anonymous user" do
    {conn, resp_body} = get_doc "doc-of-proj-b"

    assert conn.state == :sent
    assert conn.status == 401
    assert resp_body.error == "unauthorized"
  end

  test "get document as logged in user" do
    {conn, doc} = get_doc "doc-of-proj-b", "user-1", "pass-1"

    assert conn.state == :sent
    assert conn.status == 200
    assert doc.project == "b"
  end

  test "show multiple documents" do
    conn = call_get "/documents", nil, nil
    # todo as an anonymous user, get documents should get us the documents from project a
    assert Core.Utils.atomize(Poison.decode!(conn.resp_body)).hits == []

    # todo as user-1, we should see documents from project a and project b
  end

  defp sign_in name, pass do
    conn = conn(:post, "/auth/sign_in", %{ name: name, pass: pass })
      |> Api.Router.call(@opts)
    Poison.decode!(conn.resp_body)["token"]
  end

  defp get_doc id do
    get_doc id, nil, nil
  end
  defp get_doc id, user, pass do
    conn = call_get "/documents/" <> id, user, pass
    { conn, Core.Utils.atomize(Poison.decode!(conn.resp_body)) }
  end

  defp show_rights user, pass do
    conn = call_get "/auth/show", user, pass
    Core.Utils.atomize(Poison.decode!(conn.resp_body)).rights.readable_projects
  end

  defp call_get path, user, pass do
    conn = conn(:get, path)
    conn = if user == nil do conn else put_req_header(conn, "authorization", sign_in(user, pass)) end
    Api.Router.call(conn, @opts)
  end
end