defmodule Api.Auth.Bearer do
  alias Core.Config
  alias Api.Auth.Rights
  alias Api.Auth.Guardian

  @anonymous "anonymous"

  def get_user_for_bearer(nil), do: anonymous_user()
  def get_user_for_bearer(bearer) do
    token = String.replace bearer, "Bearer ", ""
    case Guardian.resource_from_token(token) do
      {:ok, user, _} -> user
      _ -> anonymous_user() # todo write test
    end
  end

  defp anonymous_user do
    users = Core.Config.get(Api.Auth, :users)
    anonymous = (Enum.find(
                  users,
                  %{name: @anonymous},
                  fn user -> user.name == @anonymous end
                ))
    is_admin = anonymous[:admin] == true

    readable_projects = if is_admin do
      Config.get(:projects)
    else
      Config.get(Api.Auth, :readable_projects)[@anonymous] || []
    end

    %{
      user: @anonymous,
      is_admin: is_admin,
      readable_projects: readable_projects
    }
  end
end

