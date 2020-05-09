defmodule Api.Auth.Rights do

  def empty, do: %{
    user: "anonymous",
    readable_projects: Application.get_env(:api, Api.Auth)[:readable_projects]["anonymous"]
  }
end