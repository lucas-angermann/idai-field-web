defmodule Services.Gazetteer do
  alias Services.ResultHandler
  require Logger

  def get_place(gazetteer_id) do
    HTTPoison.get("#{Core.Config.get(:gazetteer_url)}/doc/#{gazetteer_id}.json")
    |> ResultHandler.handle_result
  end
end
