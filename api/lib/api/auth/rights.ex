defmodule Api.Auth.Rights do

  def empty, do: %{ user: "anonymous", readable_projects: [] }
end