defmodule Core.ProjectConfigLoader do
  require Logger
  use Agent

  def start_link({project_config_dir_name, projects}) do
    
    projects = (projects || Core.Config.get(:projects)) ++ ["default"]
    
    configs = for project <- projects, into: %{} do
      {
        project,
        load(project_config_dir_name, project)
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
