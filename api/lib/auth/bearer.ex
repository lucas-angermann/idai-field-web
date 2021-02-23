defmodule Api.Auth.Bearer do
  alias Api.Core.Config
  alias Api.Auth.Guardian
  import Api.Auth.Helpers

  @anonymous "anonymous"

  def get_user_for_bearer(nil, _rights = %{ readable_projects: readable_projects}) do
    anonymous_user(readable_projects)
  end
  def get_user_for_bearer(bearer, _rights = %{ readable_projects: readable_projects }) do
    token = String.replace bearer, "Bearer ", ""
    case Guardian.resource_from_token(token) do
      {:ok, token_content, _} -> assemble_user_info(token_content.user_name, readable_projects)
      _ -> anonymous_user(readable_projects) # todo write test
    end
  end

  defp anonymous_user(readable_projects) do
    assemble_user_info(@anonymous, readable_projects)
  end

  defp assemble_user_info(user_name, readable_projects) do
    all_readable_projects = if not is_admin(user_name) do
      user_specific_readable_projects = if user_name != @anonymous, do: get_readable_projects(user_name, readable_projects), else: []
      anonymously_readable_projects = get_readable_projects(@anonymous, readable_projects)
      Enum.uniq(user_specific_readable_projects ++ anonymously_readable_projects)
    else
      Config.get(:projects)
    end
    %{ 
      user_name: user_name, 
      readable_projects: all_readable_projects,
      is_admin: is_admin(user_name)
    }
  end

  defp get_readable_projects(user_name, readable_projects) do
    user_name = if is_atom(user_name), do: user_name, else: String.to_atom(user_name)
    readable_projects[user_name]
    || readable_projects[Atom.to_string(user_name)]
    || []
  end
end
