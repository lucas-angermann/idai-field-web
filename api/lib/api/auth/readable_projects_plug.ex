defmodule Api.Auth.ReadableProjectsPlug do
  import Plug.Conn

  import RouterUtils, only: [get_rights: 1]
  
  def init(options) do
    options
  end
  
  def call(conn, _opts) do
    { readable_projects, _ } = get_rights(conn)
    conn
    |> put_private(:readable_projects, readable_projects)
  end
end
