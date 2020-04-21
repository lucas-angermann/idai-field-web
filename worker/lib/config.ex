defmodule Worker.Config do

  def get(key), do: Application.fetch_env!(:worker, key)
end