defmodule Core.ProjectConfigLoader do
  use Agent

  def start_link do
    databases = Application.fetch_env!(:api, :couchdb_databases)
    configs = for database <- databases, into: %{} do
      {
        database,
        load(Application.fetch_env!(:api, :config_dir), database)
      }
    end
    Agent.start_link(fn -> configs end, name: __MODULE__)
  end

  def get(project_name), do: Agent.get(__MODULE__, fn configs -> configs[project_name]  end)

  defp load(config_dir, project_name) do
    IO.puts "Load Project Configuration: #{project_name}"
    with {:ok, body} <- File.read("#{config_dir}/#{project_name}.json"),
         {:ok, json} <- Poison.decode(body), do: Core.Utils.atomize(json, [:values])
  end
end
