defmodule Enricher.Relations do
  require Logger

  @result_document_properties [:shortDescription, :id, :type, :category, :identifier]

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def expand(change = %{ doc: %{ project: project, resource: %{ relations: relations }}}) do
    put_in(change.doc.resource.relations, Enum.map(relations, &(expand_relation(&1, project))) |> Enum.into(%{}))
  end

  defp expand_relation({ name, targets }, project) do
    { name, Enum.map(targets, &(expand_target(&1, project))) }
  end

  defp expand_target(targetId, project) do
    doc = get_doc_from_couchdb(targetId, project)
    case doc do
      nil -> %{ resource: %{ id: targetId, deleted: true }}
      _ -> %{ resource: Map.take(doc.resource, @result_document_properties) }
    end
  end

  defp get_doc_from_couchdb(id, db) do
    auth = [hackney: [basic_auth: {Core.Config.get(:couchdb_user), Core.Config.get(:couchdb_password)}]]
    handle_result HTTPoison.get("#{Core.Config.get(:couchdb_url)}/#{db}/#{id}", %{}, auth)
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_ok(status_code) do

    Poison.decode!(body)
    |> Core.CorePropertiesAtomizing.format_document
  end
  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_error(status_code) do

    Logger.error "Failed to retrieve document, result: #{inspect body}"
    nil
  end
  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do

    Logger.error "ERROR: Failed to retrieve document, reason: #{inspect reason}"
    nil
  end

end
