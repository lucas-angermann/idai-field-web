defmodule Core.ProjectConfigLoader do
  require Logger
  use Agent

  def start_link(params = {config_dir_name, database_names}) do

    databases = database_names || Core.Config.get(:couchdb_databases)

    configs = for database <- databases, into: %{} do
      {
        database,
        load(config_dir_name || Core.Config.get(:config_dir), database)
      }
    end
    Agent.start_link(fn -> configs end, name: __MODULE__)
  end
  def start_link(_), do: start_link({nil, nil})

  def get(project_name), do: Agent.get(__MODULE__, fn configs -> configs[project_name]  end)

  defp load(config_dir, project_name) do
    Logger.info "Load Project Configuration: #{project_name}"
    with {:ok, body} <- File.read("#{config_dir}/#{project_name}.json"),
         {:ok, json} <- Poison.decode(body), do: Core.Utils.atomize(json, [:values])
  end
end
