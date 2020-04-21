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
    {:ok, result} = HTTPoison.put(
      "#{Config.get(:elasticsearch_url)}/#{Config.get(:elasticsearch_index)}/_doc/#{change.id}",
      Poison.encode!(change.doc),
      [{"content-type", "application/json"}]
    )
    result
  end
end