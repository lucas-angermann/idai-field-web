defmodule Api.Auth.Guardian do
  use Guardian, otp_app: :api

  def subject_for_token(user_json, _claims) do

    user = User.by(user_json)

    rights = Poison.encode!(%{
      user: user.name,
      readable_projects: Application.get_env(:api, Api.Auth)[:readable_projects][user.name]
    })

    {:ok, rights}
  end

  def resource_from_claims(claims) do

    rights = Poison.decode!(claims["sub"])
    {:ok, rights}
  end
end