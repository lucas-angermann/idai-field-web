defmodule Api.Auth.RouterTest do
    use ExUnit.Case, async: true
    use Plug.Test
  
    @auth_show_path Api.AppTestHelper.auth_path <> "/show"
  
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
        Api.Core.Utils.atomize(Poison.decode!(conn.resp_body))
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
  end
  