defmodule Api.Auth.AdminRightsPlug do
  import Plug.Conn
  import Api.RouterUtils, only: [send_unauthorized: 1, get_user: 1]
  alias Api.Core.Config

  def init(options), do: options

  def call(conn, _opts) do
    if not is_admin(get_user(conn).user_name) do
      conn
      |> send_unauthorized
      |> halt
    else
      conn
    end
  end

  # TODO review; anonymous user?; see also rights.ex; should the property not come from get_user now?
  defp is_admin(user_name) do
    users = Config.get(:rights).users
    user  = Enum.find(users, %{}, fn user -> user.name == user_name end)
    user[:admin] == true
  end
end
