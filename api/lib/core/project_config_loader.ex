defmodule Core.ProjectConfigLoader do
  require Logger
  use Agent

  def start_link({project_config_dir_name, database_names}) do
    
    databases = (database_names || Core.Config.get(:couchdb_databases)) ++ ["default"]
    
    configs = for database <- databases, into: %{} do
      {
        database,
        load(project_config_dir_name, database)
      }
    end
    Agent.start_link(fn -> configs end, name: __MODULE__)
  end
  def start_link(_), do: start_link({nil, nil})

  def get(project_name), do: Agent.get(__MODULE__, fn configs -> configs[project_name]  end)

  defp load(config_dir, project_name) do
    
    file_name = config_dir <> "/" <> project_name <> ".json"
    
    Logger.info "Load Project Configuration from #{file_name}"
    with {:ok, body} <- File.read(file_name),
         {:ok, json} <- Poison.decode(body)
    do
      Core.Utils.atomize(json, [:values])
    else
      _ ->
        IO.puts "Could not load Project Configuration from #{file_name}"
        %{}
    end
  end
end
