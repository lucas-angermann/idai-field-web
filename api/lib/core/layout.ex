defmodule Core.Layout do

  @core_fields [:id, :identifier, :shortDescription, :type, "geometry", "georeference", :groups]

  def to_layouted_document(doc, configuration) do

    %{ groups: config_groups } = Core.CategoryTreeList.find_by_name(doc["resource"].type, configuration)

    doc
    |> update_in(["resource"], &(add_groups(&1, config_groups)))
    |> update_in(["resource"], &(Map.take(&1, @core_fields)))
  end

  defp add_groups(resource, config_groups) do

    put_in(resource, [:groups], Enum.flat_map(config_groups, scan_group(resource)))
  end

  defp scan_group(resource) do
    fn config_item ->
      group = %{
          fields: Enum.flat_map(config_item.fields, scan_field(resource)),
          relations: Enum.flat_map(config_item.relations, scan_relation(resource)),
          name: config_item.name
      }
      if group.fields != nil or group.relations != nil, do: [group], else: []
    end
  end

  defp scan_relation(resource) do
    fn config_item ->
      unless Map.has_key?(get_in(resource, ["relations"]), config_item.name), do: [], else:
        [%{
          name: config_item.name,
          label: config_item.label,
          description: config_item.description,
          targets: get_in(resource, ["relations", config_item.name])
          }]
    end
  end

  defp scan_field(resource) do
    fn config_item ->
      unless Map.has_key?(resource, config_item.name), do: [], else:
        [%{
            name: config_item.name,
            label: config_item.label,
            description: config_item.description,
            value: get_in(resource, [config_item.name])
          }]
    end
  end
end
