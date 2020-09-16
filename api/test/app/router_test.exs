defmodule Api.RouterTest do
  use ExUnit.Case, async: true
  use Plug.Test

  @api_path Api.AppTestHelper.api_path
  @auth_show_path Api.AppTestHelper.auth_path <> "/show"
  @documents_path @api_path <> "/documents"
  @map_path @documents_path <> "/map"

  @user1 {"user-1", "pass-1"}
  @user2 {"user-2", "pass-2"}
  @user3 {"user-3", "pass-3"}

  setup context do
    conn = conn(:get, context[:path])
    conn = Api.Router.call((if login_info = context[:login] do
      {name, pass} = login_info
      put_req_header(conn, "authorization", Api.AppTestHelper.sign_in(name, pass))
    else
      conn
    end), Api.AppTestHelper.opts)
    body = if Enum.member?(conn.resp_headers, {"content-type", "application/json; charset=utf-8"}) do
      Core.Utils.atomize(Poison.decode!(conn.resp_body))
    else
      conn.resp_body
    end
    [conn: conn, body: body]
  end

  @tag path: @auth_show_path
  test "show rights - anonymous", context do
    assert context.body.rights.readable_projects == ["a"]
  end
  @tag path: @auth_show_path, login: @user1
  test "show rights - user-1", context do
    assert context.body.rights.readable_projects == ["a", "b", "c", "d"]
  end
  @tag path: @auth_show_path, login: @user2
  test "show rights - user-2", context do
    assert context.body.rights.readable_projects == ["a", "b", "c"]
  end
  @tag path: @auth_show_path, login: @user3
  test "show rights - user-3", context do
    assert context.body.rights.readable_projects == ["a", "b"]
  end

  @tag path: @documents_path <> "/doc-of-proj-a"
  test "get document", context do
    assert context.conn.state == :sent
    assert context.conn.status == 200
    assert context.body.project == "a"
  end

  @tag path: @documents_path <> "/doc-of-proj-b"
  test "do not get document as anonymous user", context do
    assert context.conn.state == :sent
    assert context.conn.status == 401
    assert context.body.error == "unauthorized"
  end

  @tag path: @documents_path <> "/doc-of-proj-b", login: @user1
  test "get document as logged in user", context do
    assert context.conn.state == :sent
    assert context.conn.status == 200
    assert context.body.project == "b"
  end

  @tag path: @documents_path
  test "show multiple documents - only project 'a' documents for anonymous user", context do
    assert length(context.body.documents) == 1
    assert List.first(context.body.documents).project == "a"
  end

  @tag path: @documents_path, login: @user1
  test "show multiple documents - all documents for user-1", context do
    assert length(context.body.documents) == 2
    assert List.first(context.body.documents).project == "a"
    assert List.last(context.body.documents).project == "b"
  end

  @tag path: @map_path
  test "show geometries - only project 'a' documents for anonymous user", context do
    assert length(context.body.documents) == 1
    assert List.first(context.body.documents).project == "a"
  end

  @tag path: @map_path, login: @user1
  test "show geometries - all documents for user-1", context do
    assert length(context.body.documents) == 2
    assert List.first(context.body.documents).project == "a"
    assert List.last(context.body.documents).project == "b"
  end
end
