defmodule Core.ProjectConfigLoader do

  def start_link do
    databases = Application.fetch_env!(:api, :couchdb_databases)
    configs = for database <- databases, into: %{} do
      {
        database,
        load(Application.fetch_env!(:api, :config_dir), database)
      }
    end
    Task.start_link(fn -> loop(configs) end)
  end

  defp loop(configs) do
    receive do
      {:get, caller, config} ->
        send caller, configs[config]
        loop(configs)
    end
  end

  defp load(config_dir, project_name) do
    IO.puts "Load Project Configuration: #{project_name}"
    with {:ok, body} <- File.read("#{config_dir}/#{project_name}.json"),
         {:ok, json} <- Poison.decode(body), do: Core.Utils.atomize(json, [:values])
  end

  def get(project_name) do
    send :project_config_loader, {:get, self(), project_name}
    receive do
      project_config -> project_config
    end
  end
end
