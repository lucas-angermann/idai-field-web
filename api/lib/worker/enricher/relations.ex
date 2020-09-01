defmodule Enricher.Relations do
  require Logger

  @result_document_properties [:shortDescription, :id, :type, :category, :identifier]

  def expand(change = %{ doc: %{ resource: %{ relations: relations }}}, get_for_id) do
    put_in(change.doc.resource.relations, Enum.map(relations, &(expand_relation(&1, get_for_id))) |> Enum.into(%{}))
  end

  defp expand_relation({ name, targets }, get_for_id) do
    { name, Enum.map(targets, &(expand_target(&1, get_for_id))) }
  end

  defp expand_target(target_id, get_for_id) do
    doc = get_for_id.(target_id)
    case doc do
      %{ resource: resource } -> map_resource(resource)
      nil -> %{ resource: %{ id: target_id, deleted: true }}
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
