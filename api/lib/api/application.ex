defmodule Api.Application do
  require Logger

  use Application

  def start(_type, _args) do

    Logger.info "Starting iDAI.field backend #{inspect Mix.env()}"

    children = [
      Api.Router,
      %{
        id: Core.ProjectConfigLoader,
        start: {
          Core.ProjectConfigLoader,
          :start_link,
          [
            {
              if Mix.env() == :test do "test/resources" else "resources/projects" end,
              Core.Config.get(:projects)
            }
          ]
        }
      }
    ]
    opts = [strategy: :one_for_one, name: Api.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
