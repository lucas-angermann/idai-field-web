defmodule Api.Auth.Guardian do
  use Guardian, otp_app: :api

  def subject_for_token(user, _claims) do
    {:ok, user.name}
  end

  def resource_from_claims(claims) do
    {:ok, %{a: 1}}
  end
end