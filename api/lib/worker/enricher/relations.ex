defmodule Enricher.Relations do
  @result_document_properties [:shortDescription, :id, :type, :category, :identifier]

  def expand(change = %{ doc: %{ resource: %{ relations: relations }}}, target_docs_map) do
    put_in(change.doc.resource.relations, Enum.map(relations, &(expand_relation(&1, target_docs_map))) |> Enum.into(%{}))
  end

  defp expand_relation({ name, targets }, target_docs_map) do
    { name, Enum.map(targets, &(expand_target(&1, target_docs_map))) }
  end

  defp expand_target(targetId, target_docs_map) do
    doc = target_docs_map[targetId]
    case doc do
      nil -> %{ resource: %{ id: targetId, deleted: true }}
      _ -> map_resource(doc.resource)
    end
  end

  defp map_resource(resource) do
    result = %{ resource: Map.take(resource, @result_document_properties) }
    result = if Map.has_key?(result.resource, :type) do
      {category, result} = pop_in(result.resource[:type])
      put_in(result, [:resource, :category], category)
    end
    result
  end
end
