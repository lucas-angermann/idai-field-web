defmodule Api.Auth.Bearer do
  alias Api.Auth.Rights
  alias Api.Auth.Guardian

  def get_user_for_bearer(nil), do: Rights.empty()
  def get_user_for_bearer(bearer) do
    token = String.replace bearer, "Bearer ", ""
    {:ok, user, _} = Guardian.resource_from_token(token)
    # TODO handle error
    user
  end
end