defmodule Api.Auth.Guardian do
  use Guardian, otp_app: :api

  def subject_for_token(user_json, _claims) do
    user = User.by(user_json)
    {:ok, user.name}
  end

  def resource_from_claims(claims) do
    {:ok, User.by(claims["sub"])}
  end
end