defmodule Api.Config do

  def get(key), do: Application.fetch_env!(:api, key)
end
