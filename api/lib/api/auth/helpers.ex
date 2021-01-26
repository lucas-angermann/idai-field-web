defmodule Api.Auth.Helpers do

  def is_admin(user_name) do
    users = Core.Config.get(Api.Auth, :users)
    user  = Enum.find(users, %{}, fn user -> user.name == user_name end)
    user[:is_admin] == true
  end
end
