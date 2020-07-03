defmodule Core.ProjectConfigLoader do
    
    def load(config_dir, project_name) do
        with {:ok, body} <- File.read("#{config_dir}/#{project_name}.json"),
             {:ok, json} <- Poison.decode(body), do: json
    end
end
