defmodule Api.Application do
  require Logger

  use Application

  def start(_type, _args) do

    Logger.info "Starting iDAI.field backend"

    children = [Api.Router, Core.ProjectConfigLoader]
    opts = [strategy: :one_for_one, name: Api.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
