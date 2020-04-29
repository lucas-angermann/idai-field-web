defmodule Indexer do
  alias Worker.Config

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def process(change = %{deleted: true}) do
    # TODO: Handle deletions
    IO.puts "Deleted: #{change.id}"
  end

  def process(change) do
    handle_result HTTPoison.put(
      "#{Config.get(:elasticsearch_url)}/#{Config.get(:elasticsearch_index)}/_doc/#{change.id}",
      Poison.encode!(change.doc),
      [{"content-type", "application/json"}]
    )
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_ok(status_code) do

    result = Poison.decode!(body)
    IO.puts "Successfully indexed: #{result["_id"]}"
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_error(status_code) do

    result = Poison.decode!(body)
    IO.puts "ERROR: Indexing failed, result: #{inspect result}"
    nil
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do

    IO.puts "ERROR: Indexing failed, reason: #{inspect reason}"
    nil
  end
end
