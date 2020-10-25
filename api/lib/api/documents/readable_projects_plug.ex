defmodule Api.Documents.ReadableProjectsPlug do
  import Plug.Conn
  
  def init(options) do
    options
  end
  
  def call(conn, _opts) do
    {readable_projects, is_admin} = get_rights(conn)
    conn
    |> put_private(:is_admin, is_admin)
    |> put_private(:readable_projects, readable_projects)
  end

  defp get_rights conn do
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
