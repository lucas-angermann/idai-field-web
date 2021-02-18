defmodule Api.Auth.Helpers do
  alias Api.Core.Config

  def is_admin(user_name) do
    users = Config.get(Api.Auth, :users)
    user  = Enum.find(users, %{}, fn user -> user.name == user_name end)
    user[:admin] == true
  end

  def get_readable_projects(user_name) do
    user_name = if is_atom(user_name), do: user_name, else: String.to_atom(user_name)
    Config.get(Api.Auth, :readable_projects)[user_name]
    || Config.get(Api.Auth, :readable_projects)[Atom.to_string(user_name)]
    || []
  end
end
