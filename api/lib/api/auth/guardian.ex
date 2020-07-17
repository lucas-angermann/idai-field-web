defmodule Api.Auth.Guardian do
  use Guardian, otp_app: :api

  def subject_for_token(user_json, _claims) do
    user = User.by(user_json)
    readable_projects = Core.Config.get(Api.Auth, :readable_projects)[user.name]

    rights = Poison.encode!(%{
      user: user.name,
      readable_projects: readable_projects
    })
    {:ok, rights}
  end

  def resource_from_claims(claims) do

    rights = Core.Utils.atomize(Poison.decode!(claims["sub"]))
    {:ok, rights}
  end
end