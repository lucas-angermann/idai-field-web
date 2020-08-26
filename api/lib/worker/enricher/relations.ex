defmodule Enricher.Relations do
  require Logger

  @result_document_properties [:shortDescription, :id, :type, :category, :identifier]

  def expand(change = %{ doc: %{ project: project, resource: %{ relations: relations }}}, target_docs_map) do
    put_in(change.doc.resource.relations, Enum.map(relations, &(expand_relation(&1, project, target_docs_map))) |> Enum.into(%{}))
  end

  defp expand_relation({ name, targets }, project, target_docs_map) do
    { name, Enum.map(targets, &(expand_target(&1, project, target_docs_map))) }
  end

  defp expand_target(targetId, project, target_docs_map) do
    doc = target_docs_map[targetId]
    case doc do
      nil -> %{ resource: %{ id: targetId, deleted: true }}
      _ -> map_resource(doc.resource, project)
    end
  end

  defp map_resource(resource, project) do
    result = %{ resource: Map.take(resource, @result_document_properties), project: project }
    result = if Map.has_key?(result.resource, :type) do
      {category, result} = pop_in(result.resource[:type])
      put_in(result, [:resource, :category], category)
    end
    result
  end
end
