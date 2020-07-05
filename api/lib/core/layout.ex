defmodule Core.Layout do

  @core_fields ["id", "identifier", "shortDescription", "type", "geometry", "georeference", "groups"]

  def to_layouted_document(doc, configuration) do

    %{ "groups" => config_groups } = Core.CategoryTreeList.find_by_name(doc["resource"]["type"], configuration)

    doc
    |> update_in(["resource"], &(add_groups(&1, config_groups)))
    |> update_in(["resource"], &(Map.take(&1, @core_fields)))
  end

  defp add_groups(resource, config_groups) do

    put_in(resource, ["groups"], Enum.flat_map(config_groups, scan_group(resource)))
  end

  defp scan_group(resource) do
    fn %{
         "fields" => fields,
         "name" => name,
         "relations" => relations
       } ->

      group = %{
          fields: Enum.flat_map(fields, scan_field(resource)),
          relations: Enum.flat_map(relations, scan_relation(resource)),
          name: name
      }
      if group.fields != nil or group.relations != nil, do: [group], else: []
    end
  end

  defp scan_relation(resource) do
    fn %{
         "name" => name,
         "label" => label,
         "description" => description
       } ->

      unless Map.has_key?(get_in(resource, ["relations"]), name), do: [], else:
        [%{
            name: name,
            label: label,
            description: description,
            targets: get_in(resource, ["relations", name])
          }]
    end
  end

  defp scan_field(resource) do
    fn %{
         "name" => name,
         "label" => label,
         "description" => description
       } ->

      unless Map.has_key?(resource, name), do: [], else:
        [%{
            name: name,
            label: label,
            description: description,
            value: get_in(resource, [name])
          }]
    end
  end
end
