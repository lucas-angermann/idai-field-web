defmodule Core.ProjectConfigLoader do
    
    def load(config_dir, project_name) do
        with {:ok, body} <- File.read("#{config_dir}/#{project_name}.json"),
             {:ok, json} <- Poison.decode(body), do: Core.Utils.atomize(json, [:values])
    end
end
