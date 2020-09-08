defmodule Api.ImagesTest do
  use ExUnit.Case, async: true
  use Plug.Test

  @opts Api.Router.init([])

  @api_path "/api"
  @auth_path @api_path <> "/auth"
  @auth_show_path @auth_path <> "/show"
  @auth_sign_in_path @auth_path <> "/sign_in"
  @image_path @api_path <> "/images"

  @user1 {"user-1", "pass-1"}
  @user2 {"user-2", "pass-2"}
  @user3 {"user-3", "pass-3"}

#  setup context do
#    conn = conn(:get, context[:path])
#    conn = Api.Router.call((if login_info = context[:login] do
#                              {name, pass} = login_info
#                              put_req_header(conn, "authorization", sign_in(name, pass))
#                            else
#                              conn
#                            end), @opts)
#    body = if Enum.member?(conn.resp_headers, {"content-type", "application/json; charset=utf-8"}) do
#      Core.Utils.atomize(Poison.decode!(conn.resp_body))
#    else
#      conn.resp_body
#    end
#    [conn: conn, body: body]
#  end
#
  @tag path: @image_path <> "/a/doc-of-proj-a"
  test "get image", context do
    assert context.conn.state == :sent
    assert context.conn.status == 200
  end

#  @tag path: @image_path <> "/b/doc-of-proj-b"
#  test "image not authorized", context do
#    assert context.conn.state == :sent
#    assert context.conn.status == 401
#    assert context.body.error == "unauthorized"
#  end

#  @tag path: @image_path <> "/b/doc-of-proj-b", login: @user1
#  test "image authorized", context do
#    assert context.conn.state == :sent
#    assert context.conn.status == 200
#  end
#
#  @tag path: @image_path <> "/c/non-existing-doc", login: @user2
#  test "image not found", context do
#    assert context.conn.state == :sent
#    assert context.conn.status == 404
#    assert context.body.error == "not_found"
#  end
#
#  defp sign_in name, pass do
#    conn = conn(:post, @auth_sign_in_path, %{ name: name, pass: pass })
#           |> Api.Router.call(@opts)
#    Poison.decode!(conn.resp_body)["token"]
#  end
end
