defmodule Core.Config do
  require Logger

  def get(key) do
    with {:ok, val} <- Application.fetch_env(:api, key) do
      val
    else
      _ -> Logger.error "#{key} not set in config!"
      nil
    end
  end
end
