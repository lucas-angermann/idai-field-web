defmodule Worker.Indexer do
  require Logger
  alias Core.Config

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  @doc """
  Indexes a single document
  """
  def process(project, index), do: fn change -> process(change, project, index) end
  def process(nil, _, _), do: nil
  def process(change = %{deleted: true}, project, index) do
    # TODO: mark documents as deleted instead of removing them from index
    case HTTPoison.delete(get_doc_url(change.id, index)) do
      # Deleted documents possibly never existed in the index, so ignore 404s
      {:ok, %HTTPoison.Response{status_code: 404, body: _}} -> nil
      result -> handle_result(result, change, project)
    end
  end
  def process(change, project, index) do
    HTTPoison.put(
      get_doc_url(change.id, index),
      Poison.encode!(change.doc),
      [{"Content-Type", "application/json"}]
    )
    |> handle_result(change, project)
  end

  @doc """
  Creates a new index with new name for a given project, where the project is given by an index alias.

  Returns a concrete index name for a project, as given by an index alias, which can be written to.
  """
  def create_project_and_set_alias(project) do
    alias = "#{Config.get(:elasticsearch_index_prefix)}_#{project}"
    # index = alias <> "__a__" # TODO enable
    index = alias              # 
    with {:ok, _} <- HTTPoison.put("#{Config.get(:elasticsearch_url)}/#{index}"),
         {:ok, _} <- HTTPoison.post("#{Config.get(:elasticsearch_url)}/_aliases", 
         Poison.encode!(%{ actions: %{ add: %{ index: index, alias: alias }}}), 
         [{"Content-Type", "application/json"}])
    do
      Logger.info "Successfully created project and alias"
    else
      err -> Logger.error "Creating project and alias failed: #{inspect err}"
    end
    index
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

  defp get_doc_url(id, index), do: "#{Config.get(:elasticsearch_url)}/#{index}/_doc/#{id}"
  
  defp get_template_url() do
    "#{Config.get(:elasticsearch_url)}/"
    <> "_template/"
    <> "#{Config.get(:elasticsearch_index_prefix)}"
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
