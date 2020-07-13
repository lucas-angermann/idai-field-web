defmodule Indexer do

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def process(change = %{deleted: true}, project) do
    # TODO: mark documents as deleted instead of removing them from index
    case HTTPoison.delete(get_doc_url(change.id, project)) do
      # Deleted documents possibly never existed in the index, so ignore 404s
      {:ok, %HTTPoison.Response{status_code: 404, body: _}} -> nil
      result -> handle_result(result)
    end
  end

  def process(change, project) do
    handle_result HTTPoison.put(
      get_doc_url(change.id, project),
      Poison.encode!(change.doc),
      [{"Content-Type", "application/json"}]
    )
  end

  def update_mapping_template() do
    with {:ok, body} <- File.read("config/elasticsearch-mapping.json"),
         {:ok, _} <- HTTPoison.put(get_template_url(), body, [{"Content-Type", "application/json"}])
    do
      IO.puts "Succesfully updated index mapping template"
    else
      err -> IO.puts "#{inspect self()} - ERROR: Updating index mapping failed: #{inspect err}"
    end
  end

  defp get_doc_url(id, project) do
    "#{Application.fetch_env!(:api, :elasticsearch_url)}/"
    <> "#{Application.fetch_env!(:api, :elasticsearch_index)}_#{project}/"
    <> "_doc/#{id}"
  end

  defp get_template_url() do
    "#{Application.fetch_env!(:api, :elasticsearch_url)}/"
    <> "_index_template/"
    <> "#{Application.fetch_env!(:api, :elasticsearch_index)}"
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
