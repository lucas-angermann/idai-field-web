defmodule Core.ProjectConfigLoader do

    def load(config_dir, project_name, locales = [_|_]) do
        for locale <- locales, into: %{} do
            {locale, load(config_dir, project_name, locale)}
        end
    end
    
    def load(config_dir, project_name, locale) do
        with {:ok, body} <- File.read("#{config_dir}/#{project_name}.#{locale}.json"),
             {:ok, json} <- Poison.decode(body), do: json
    end
end
