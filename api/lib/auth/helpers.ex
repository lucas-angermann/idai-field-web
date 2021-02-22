defmodule Api.Auth.Helpers do
  alias Api.Core.Config

  def is_admin(user_name) do
    users = Config.get(Api.Auth, :users)
    user  = Enum.find(users, %{}, fn user -> user.name == user_name end)
    user[:admin] == true
  end
end
