defmodule Api.RouterTest do
  use ExUnit.Case, async: true
  use Plug.Test

  @opts Api.Router.init([])

  setup context do
    if login_info = context[:login] do
      {name, pass} = login_info
      [token: sign_in(name, pass)]
    else
      :ok
    end
  end

  test "show rights - anonymous" do
    assert show_rights() == ["a"]
  end
  @tag login: {"user-1", "pass-1"}
  test "show rights - user-1", context do
    assert show_rights(context.token) == ["a", "b", "c", "d"]
  end
  @tag login: {"user-2", "pass-2"}
  test "show rights - user-2", context do
    assert show_rights(context.token) == ["a", "b", "c"]
  end
  @tag login: {"user-3", "pass-3"}
  test "show rights - user-3", context do
    assert show_rights(context.token) == ["a", "b"]
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

  @tag login: {"user-1", "pass-1"}
  test "get document as logged in user", context do
    {conn, doc} = get_doc "doc-of-proj-b", context.token

    assert conn.state == :sent
    assert conn.status == 200
    assert doc.project == "b"
  end

  test "show multiple documents - only project 'a' documents for anonymous user" do
    conn = get_docs()
    result = Core.Utils.atomize(Poison.decode!(conn.resp_body))
    
    assert length(result.documents) == 1
    assert List.first(result.documents).project == "a"
  end

  @tag login: {"user-1", "pass-1"}
  test "show multiple documents - all documents for user-1", context do
    conn = get_docs context.token
    result = Core.Utils.atomize(Poison.decode!(conn.resp_body))
    
    assert length(result.documents) == 2
    assert List.first(result.documents).project == "a"
    assert List.last(result.documents).project == "b"
  end

  test "show geometries - only project 'a' documents for anonymous user" do
    conn = get_geometries()
    result = Core.Utils.atomize(Poison.decode!(conn.resp_body))
    
    assert length(result.documents) == 1
    assert List.first(result.documents).project == "a"
  end

  @tag login: {"user-1", "pass-1"}
  test "show geometries - all documents for user-1", context do
    conn = get_geometries context.token
    result = Core.Utils.atomize(Poison.decode!(conn.resp_body))
    
    assert length(result.documents) == 2
    assert List.first(result.documents).project == "a"
    assert List.last(result.documents).project == "b"
  end

  defp sign_in name, pass do
    conn = conn(:post, "/auth/sign_in", %{ name: name, pass: pass })
      |> Api.Router.call(@opts)
    Poison.decode!(conn.resp_body)["token"]
  end

  defp get_doc id do
    get_doc id, nil
  end
  defp get_doc id, token do
    conn = call_get "/documents/" <> id, token
    { conn, Core.Utils.atomize(Poison.decode!(conn.resp_body)) }
  end
  defp get_docs do
    get_docs nil
  end
  defp get_docs token do
    call_get "/documents/", token
  end
  defp get_geometries do
    get_geometries nil
  end
  defp get_geometries token do
    call_get "/documents/map", token
  end
  defp show_rights token do
    (call_get("/auth/show", token).resp_body)
    |> Poison.decode!
    |> Core.Utils.atomize
    |> get_in([:rights, :readable_projects])
  end
  defp show_rights do
    show_rights nil
  end
  
  defp call_get path, token do
    conn = conn(:get, path)
    conn = if token == nil do conn else put_req_header(conn, "authorization", token) end
    Api.Router.call(conn, @opts)
  end
end
