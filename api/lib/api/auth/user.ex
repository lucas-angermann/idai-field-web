defmodule User do

  def by(%{"name" => name, "pass" => pass}) do
    users = Application.get_env(:api, Api.Auth)[:users]
    auth_ok? = fn u -> u.name == name and u.pass == pass end
    [found_user|_] = Enum.filter users, auth_ok?
    found_user
  end
end