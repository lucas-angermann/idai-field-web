defmodule Indexer do
  alias Worker.Config

  def index(changes) when is_list(changes) do
    for change <- changes, do: index change
  end

  def index(change = %{deleted: true}) do
    IO.puts "Deleted: #{change.id}"
  end

  def index(change) do
    IO.puts "Add to index: #{change.id}"
    handle_result HTTPoison.put(
      "#{Config.get(:elasticsearch_url)}/#{Config.get(:elasticsearch_index)}/_doc/#{change.id}",
      Poison.encode!(change.doc),
      [{"content-type", "application/json"}]
    )
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}}) when status_code in [200, 201]  do
    Poison.decode!(body, as: %{"results" => [%Types.Change{}]})
  end

end