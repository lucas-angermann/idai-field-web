defmodule Indexer do
  alias Worker.Config

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def process(change = %{deleted: true}) do
    # TODO: mark documents as deleted instead of removing them from index
    case HTTPoison.delete(get_doc_url(change.id)) do
      # Deleted documents possibly never existed in the index, so ignore 404s
      {:ok, %HTTPoison.Response{status_code: 404, body: _}} -> nil
      result -> handle_result(result)
    end
  end

  def process(change) do
    handle_result HTTPoison.put(
      get_doc_url(change.id),
      Poison.encode!(change.doc),
      [{"Content-Type", "application/json"}]
    )
  end

  defp get_doc_url(id) do
    "#{Config.get(:elasticsearch_url)}/#{Config.get(:elasticsearch_index)}/_doc/#{id}"
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_ok(status_code) do

    Poison.decode!(body)
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_error(status_code) do

    result = Poison.decode!(body)
    IO.puts "#{inspect self()} - ERROR: Updating index failed, status_code #{status_code}, result: #{inspect result}"
    nil
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do

    IO.puts "#{inspect self()} - ERROR: Updating index failed, reason: #{inspect reason}"
    nil
  end
end
