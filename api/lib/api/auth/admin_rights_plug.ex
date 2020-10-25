defmodule Api.Auth.AdminRightsPlug do
  import Plug.Conn
  import RouterUtils, only: [send_unauthorized: 1, get_rights: 1]

  def init(options) do
    options
  end

  def call(conn, _opts) do
    {_, is_admin} = get_rights(conn)

    if not is_admin do
      conn
      |> send_unauthorized
      |> halt
    else
      conn
    end
  end
end
