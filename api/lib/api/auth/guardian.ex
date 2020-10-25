defmodule Api.Auth.Guardian do
  use Guardian, otp_app: :api

  def subject_for_token(user_json, _claims) do
    user = user_by(user_json, Core.Config.get(Api.Auth, :users))
    readable_projects = Core.Config.get(Api.Auth, :readable_projects)[user.name] || []
    rights = Poison.encode!(%{
      user: user.name,
      is_admin: user[:admin] == true,
      readable_projects: readable_projects
    })
    {:ok, rights}
  end

  def resource_from_claims(claims) do
    rights = Core.Utils.atomize(Poison.decode!(claims["sub"]))
    {:ok, rights}
  end

  def user_by(%{"name" => name, "pass" => pass}, users) do
    auth_ok? = fn u -> u.name == name and u.pass == pass end
    [found_user|_] = Enum.filter users, auth_ok?
    found_user
  end
end
