defmodule Api.Auth.Bearer do
  alias Api.Core.Config
  alias Api.Auth.Guardian
  import Api.Auth.Helpers

  @anonymous "anonymous"

  def get_user_for_bearer(nil) do
    anonymous_user()
  end
  def get_user_for_bearer(bearer) do
    token = String.replace bearer, "Bearer ", ""
    case Guardian.resource_from_token(token) do
      {:ok, user, _} -> put_readable_projects(user)
      _ -> anonymous_user() # todo write test
    end
  end

  defp anonymous_user() do
    put_readable_projects(
      %{
        name: @anonymous,
        readable_projects: []
      }
    )
  end

  defp put_readable_projects(%{ name: user_name, readable_projects: readable_projects }) do
    all_readable_projects = if not is_admin(user_name) do
      anonymously_readable_projects = get_readable_projects(@anonymous)
      Enum.uniq(readable_projects ++ anonymously_readable_projects)
    else
      Config.get(:projects)
    end
    %{ name: user_name, readable_projects: all_readable_projects }
  end
end
