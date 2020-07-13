defmodule Api.Application do

  use Application

  def start(_type, _args) do

    IO.puts "start"

    Indexer.update_mapping_template()

    children = [Api.Router, Core.ProjectConfigLoader]
    opts = [strategy: :one_for_one, name: Api.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
