defmodule Indexer do
  alias Worker.Config

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def process(change = %{deleted: true}) do
    # TODO: changes stream may include deletes for unindexed documents
    handle_result HTTPoison.delete(get_doc_url(change.id))
  end

  def process(change) do
    handle_result HTTPoison.put(
      get_doc_url(change.id),
      Poison.encode!(change.doc),
      [{"content-type", "application/json"}]
    )
  end

  defp get_doc_url(id) do
    "#{Config.get(:elasticsearch_url)}/#{Config.get(:elasticsearch_index)}/_doc/#{id}"
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_ok(status_code) do

    result = Poison.decode!(body)
    IO.puts "#{inspect self()}: Successfully updated index: #{result["result"]} #{result["_id"]}"
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_error(status_code) do

    result = Poison.decode!(body)
    IO.puts "ERROR: Updating index failed, result: #{inspect result}"
    nil
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do

    IO.puts "ERROR: Updating index failed, reason: #{inspect reason}"
    nil
  end
end
