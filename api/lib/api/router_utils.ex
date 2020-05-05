defmodule Api.RouterUtils do
  import Plug.Conn, only: [put_resp_content_type: 2, send_resp: 3]

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
end
