defmodule Api.Auth.AdminRightsPlug do
  import Plug.Conn
  import Api.Auth.Helpers
  import RouterUtils, only: [send_unauthorized: 1, get_user_rights: 1]

  def init(options), do: options

  def call(conn, _opts) do
    {user, _} = get_user_rights(conn)

    if not is_admin(user) do
      conn
      |> send_unauthorized
      |> halt
    else
      conn
    end
  end
end
