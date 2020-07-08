defmodule Core.Layout do

  def to_layouted_resource(configuration) do
    fn resource ->
      %{ groups: config_groups } = Core.CategoryTreeList.find_by_name(resource.type, configuration)

      resource
      |> put_in([:groups], Enum.flat_map(config_groups, scan_group(resource)))
      |> Map.take(List.delete(Core.CorePropertiesAtomizing.get_core_properties(), :relations))
    end
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
      targets = resource.relations[config_item.name]

      unless targets, do: [], else:
        [%{
          name: config_item.name,
          label: config_item.label,
          description: config_item.description,
          targets: targets
          }]
    end
  end

  defp scan_field(resource) do
    fn config_item ->
      value = resource[config_item.name] || resource[String.to_atom(config_item.name)]

      unless value, do: [], else:
        [%{
            name: config_item.name,
            label: config_item.label,
            description: config_item.description,
            value: value
          }]
    end
  end
end
