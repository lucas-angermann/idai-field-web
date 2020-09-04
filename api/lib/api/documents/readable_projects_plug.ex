defmodule Api.Documents.ReadableProjectsPlug do
  import Plug.Conn
  
  def init(options) do
    options
  end
  
  def call(conn, _opts) do
    put_private(conn, :readable_projects, get_readable_projects(conn))
  end

  defp get_readable_projects conn do
    (conn
     |> get_req_header("authorization")
     |> List.first
     |> Api.Auth.Bearer.get_user_for_bearer).readable_projects
  end
end
