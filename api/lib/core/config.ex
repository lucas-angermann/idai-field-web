defmodule Core.Config do

  def get(key) do
    with {:ok, val} <- Application.fetch_env(:api, key) do
      val
    else
      _ -> IO.puts "#{inspect self()} - ERROR: #{key} not set in config!"
      nil
    end
  end
end
