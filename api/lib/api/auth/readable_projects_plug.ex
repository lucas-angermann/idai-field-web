defmodule Api.Auth.ReadableProjectsPlug do
  import Plug.Conn
  import RouterUtils, only: [get_user_rights: 1]

  def init(options), do: options

  def call(conn, _opts) do
    conn
    |> put_private(:readable_projects, get_user_rights(conn).readable_projects)
  end
end
