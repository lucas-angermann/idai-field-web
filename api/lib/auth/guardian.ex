defmodule Api.Auth.Guardian do
  use Guardian, otp_app: :api
  alias Api.Auth.Helpers

  @impl true
  def subject_for_token(user, _claims) do
    
    readable_projects = Helpers.get_readable_projects(user.name)
    rights = Poison.encode!(%{
      name: user.name,
      readable_projects: readable_projects
    })
    {:ok, rights}
  end
    
  @impl true
  def resource_from_claims(claims) do
    rights = Api.Core.Utils.atomize(Poison.decode!(claims["sub"]))
    {:ok, rights}
  end
end
