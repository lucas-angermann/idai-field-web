defmodule Core.Config do
  require Logger

  def get(key), do: get(nil, key)
  def get(module, key) do
    if Mix.env() == :test do
      get_test module, key
    else
      get_default module, key
    end
  end

  def get_default module, key do
    with {:ok, val} <- Application.fetch_env(:api, key) do
      val
    else
      _ -> Logger.error "#{key} not set in config!"
           nil
    end
  end

  defp get_test module, key do

    if module == Elixir.Api.Auth do
      case key do
        :readable_projects ->
          %{
            "user-1" => ["a", "b", "c", "d"],
            "user-2" => ["a", "b", "c"],
            "user-3" => ["a", "b"],
            "anonymous" => ["a"]
          }
        :users ->
          [
            %{ name: "user-1", pass: "pass-1" },
            %{ name: "user-2", pass: "pass-2" },
            %{ name: "user-3", pass: "pass-3" }
          ]
      end
    else
      case key  do
        :config_dir        -> "test/resources"
        :couchdb_databases -> ["a", "b"]
        _                  -> get_default module, key
      end
    end
  end
end
