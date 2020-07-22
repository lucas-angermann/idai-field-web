defmodule Api.RouterTest do
  use ExUnit.Case, async: true
  use Plug.Test

  @opts Api.Router.init([])
  
  @auth_path "/auth"
  @auth_show_path @auth_path <> "/show"
  @auth_sign_in_path @auth_path <> "/sign_in"
  @documents_path "/documents"
  @map_path @documents_path <> "/map"
  
  @user1 {"user-1", "pass-1"}
  @user2 {"user-2", "pass-2"}
  @user3 {"user-3", "pass-3"}

  setup context do
    conn = conn(:get, context[:path])
    [conn: (if login_info = context[:login] do
      {name, pass} = login_info
      put_req_header(conn, "authorization", sign_in(name, pass))
    else
      conn
    end)]
  end

  @tag path: @auth_show_path
  test "show rights - anonymous", context do
    assert show_rights(context.conn) == ["a"]
  end
  @tag path: @auth_show_path, login: @user1
  test "show rights - user-1", context do
    assert show_rights(context.conn) == ["a", "b", "c", "d"]
  end
  @tag path: @auth_show_path, login: @user2
  test "show rights - user-2", context do
    assert show_rights(context.conn) == ["a", "b", "c"]
  end
  @tag path: @auth_show_path, login: @user3
  test "show rights - user-3", context do
    assert show_rights(context.conn) == ["a", "b"]
  end
  
  @tag path: @documents_path <> "/doc-of-proj-a"
  test "get document", context do
    {conn, doc} = call context.conn

    assert conn.state == :sent
    assert conn.status == 200
    assert doc.project == "a"
  end

  @tag path: @documents_path <> "/doc-of-proj-b"
  test "do not get document as anonymous user", context do
    {conn, resp_body} = call context.conn

    assert conn.state == :sent
    assert conn.status == 401
    assert resp_body.error == "unauthorized"
  end

  @tag path: @documents_path <> "/doc-of-proj-b", login: @user1
  test "get document as logged in user", context do
    {conn, doc} = call context.conn

    assert conn.state == :sent
    assert conn.status == 200
    assert doc.project == "b"
  end

  @tag path: @documents_path
  test "show multiple documents - only project 'a' documents for anonymous user", context do
    {_, result} = call context.conn
    
    assert length(result.documents) == 1
    assert List.first(result.documents).project == "a"
  end

  @tag path: @documents_path, login: @user1
  test "show multiple documents - all documents for user-1", context do
    {_, result} = call context.conn
    
    assert length(result.documents) == 2
    assert List.first(result.documents).project == "a"
    assert List.last(result.documents).project == "b"
  end

  @tag path: @map_path
  test "show geometries - only project 'a' documents for anonymous user", context do
    {_, result} = call context.conn
    
    assert length(result.documents) == 1
    assert List.first(result.documents).project == "a"
  end

  @tag path: @map_path, login: @user1
  test "show geometries - all documents for user-1", context do
    {_, result} = call context.conn
    
    assert length(result.documents) == 2
    assert List.first(result.documents).project == "a"
    assert List.last(result.documents).project == "b"
  end

  defp sign_in name, pass do
    conn = conn(:post, @auth_sign_in_path, %{ name: name, pass: pass })
      |> Api.Router.call(@opts)
    Poison.decode!(conn.resp_body)["token"]
  end
  
  defp show_rights conn do
    {conn, body} = call conn
    get_in(body, [:rights, :readable_projects])
  end
  
  defp call conn do
    conn = Api.Router.call(conn, @opts)
    { conn, Core.Utils.atomize(Poison.decode!(conn.resp_body)) }
  end
end
