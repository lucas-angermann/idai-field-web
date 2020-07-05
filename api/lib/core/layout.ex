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
         "fields" => config_group_fields,
         "name" => config_group_name,
         "relations" => config_group_relations
       } ->

      group = %{
          fields: Enum.flat_map(config_group_fields, scan_field(resource)),
          relations: Enum.flat_map(config_group_relations, scan_relation(resource)),
          name: config_group_name
      }
      if group.fields != nil or group.relations != nil, do: [group], else: []
    end
  end

  defp scan_relation(resource) do
     fn %{
          "name" => config_relation_name,
          "label" => config_relation_label,
          "description" => config_relation_description
        } ->

      if Map.has_key?(get_in(resource, ["relations"]), config_relation_name) do
        [
          %{
            name: config_relation_name,
            label: config_relation_label,
            description: config_relation_description,
            targets: get_in(resource, ["relations", config_relation_name])
          }
        ]
      else
        []
      end
    end
  end

  defp scan_field(resource) do
    fn %{
         "name" => config_field_name,
         "label" => config_field_label,
         "description" => config_field_description
       } ->

      if Map.has_key?(resource, config_field_name) do
        [
          %{
            name: config_field_name,
            label: config_field_label,
            description: config_field_description,
            value: get_in(resource, [config_field_name])
          }
        ]
      else
        []
      end
    end
  end
end
