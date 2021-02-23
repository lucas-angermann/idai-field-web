defmodule Api.Auth.Helpers do
  alias Api.Auth.Guardian
  alias Api.Core.Config

  def is_admin(user_name) do
    users = Config.get(Api.Auth, :users)
    user  = Enum.find(users, %{}, fn user -> user.name == user_name end)
    user[:admin] == true
  end

  def sign_in(credentials, users) do
    case user_by(credentials, users) do
      user = %{ name: "anonymous" } -> 
        if credentials[:pass] != nil do
          %{ info: :not_found}
        else
          %{ is_admin: user.admin }
        end
      user = %{ } -> {:ok, token, _claims} = Guardian.encode_and_sign(user)
              %{ token: token, is_admin: user.admin }
      nil -> %{ info: :not_found }
    end
  end

  defp user_by(%{ name: "anonymous" }, users) do
    anon? = fn u -> u.name == "anonymous" end
    case Enum.filter users, anon? do
      [found_user|_] -> update_admin(found_user)
      [] -> %{ name: "anonymous", admin: false }
    end
  end
  defp user_by(%{ name: name, pass: pass }, users) do
    auth_ok? = fn u -> u.name == name and u.pass == pass end
    case Enum.filter users, auth_ok? do
      [found_user|_] -> update_admin(found_user)
      [] -> nil
    end
  end
  defp user_by(_, _users), do: nil

  defp update_admin(user) do
    if user[:admin] == true do
      user
    else
      put_in(user[:admin], false)
    end
  end
end
