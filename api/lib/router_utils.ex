defmodule RouterUtils do
  import Plug.Conn, only: [put_resp_content_type: 2, send_resp: 3, get_req_header: 2]

  def send_json(conn, %{error: "bad_request"} = error) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(400, Poison.encode!(error))
  end

  def send_json(conn, %{error: "not_found"} = error) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, Poison.encode!(error))
  end

  def send_json(conn, %{error: "unknown"} = error) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(500, Poison.encode!(error))
  end

  def send_json(conn, body) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Poison.encode!(body))
  end

  def send_unauthorized(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(401, Poison.encode!(%{error: :unauthorized}))
  end

  def send_error(conn, message) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(500, Poison.encode!(%{error: message}))
  end

  def send_not_found(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, Poison.encode!(%{error: :not_found}))
  end

  def access_for_project_allowed readable_projects, project do

    if project in readable_projects, do: :ok, else: :unauthorized_access
  end

  def get_rights conn do
    rights = (conn
              |> get_req_header("authorization")
              |> List.first
              |> Api.Auth.Bearer.get_user_for_bearer)
    {
      rights.readable_projects,
      rights.is_admin
    }
  end
end
