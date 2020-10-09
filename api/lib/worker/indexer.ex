defmodule Worker.Indexer do
  require Logger

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def process(project), do: fn change -> process(change, project) end
  def process(nil, _), do: nil
  def process(change = %{deleted: true}, project) do
    # TODO: mark documents as deleted instead of removing them from index
    case HTTPoison.delete(get_doc_url(change.id, project)) do
      # Deleted documents possibly never existed in the index, so ignore 404s
      {:ok, %HTTPoison.Response{status_code: 404, body: _}} -> nil
      result -> handle_result(result, change, project)
    end
  end
  def process(change, project) do
    HTTPoison.put(
      get_doc_url(change.id, project),
      Poison.encode!(change.doc),
      [{"Content-Type", "application/json"}]
    )
    |> handle_result(change, project)
  end

  def update_mapping_template() do
    with {:ok, body} <- File.read("resources/elasticsearch-mapping.json"),
         {:ok, _} <- HTTPoison.put(get_template_url(), body, [{"Content-Type", "application/json"}])
    do
      Logger.info "Successfully updated index mapping template"
    else
      err -> Logger.error "Updating index mapping failed: #{inspect err}"
    end
  end

  defp get_doc_url(id, project) do
    "#{Core.Config.get(:elasticsearch_url)}/"
    <> "#{Core.Config.get(:elasticsearch_index_prefix)}_#{project}/"
    <> "_doc/#{id}"
  end

  defp get_template_url() do
    "#{Core.Config.get(:elasticsearch_url)}/"
    <> "_template/"
    <> "#{Core.Config.get(:elasticsearch_index_prefix)}"
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}}, _, _)
    when is_ok(status_code) do

    Poison.decode!(body)
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}}, change, project)
    when is_error(status_code) do

    result = Poison.decode!(body)
    Logger.error "Updating index failed!
      status_code: #{status_code}
      project: #{project}
      id: #{change.id}
      result: #{inspect result}"
    nil
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}, change, project) do

    Logger.error "Updating index failed!
      project: #{project}
      id: #{change.id}
      reason: #{inspect reason}"
    nil
  end
end
