defmodule Core.Layout do

  @core_fields ["id", "identifier", "shortDescription", "type", "geometry", "georeference", "groups"]

  def to_layouted_document(doc, configuration) do

    %{ "groups" => config_groups } = Core.CategoryTreeList.find_by_name(doc["resource"]["type"], configuration)

    doc
    |> update_in(["resource"], &(add_groups(&1, config_groups)))
    |> update_in(["resource"], &(Map.take(&1, @core_fields)))
  end

  defp add_groups(resource, config_groups) do

    put_in(resource, ["groups"], scan_and_add(&scan_group/2, config_groups, resource))
  end

  defp scan_group(
         %{
           "fields" => config_group_fields,
           "name" => config_group_name,
           "relations" => config_group_relations
         },
         resource) do

    group = %{
        fields: scan_and_add(&scan_field/2, config_group_fields, resource),
        relations: scan_and_add(&scan_relation/2, config_group_relations, resource),
        name: config_group_name
    }
    if group.fields != nil or group.relations != nil, do: [group], else: []
  end

  defp scan_relation(%{ "name" => config_relation_name, "label" => config_relation_label }, resource) do

    if Map.has_key?(get_in(resource, ["relations"]), config_relation_name) do
      [
        %{
          name: config_relation_name,
          label: config_relation_label,
          targets: get_in(resource, ["relations", config_relation_name])
        }
      ]
    else
      []
    end
  end

  defp scan_field(%{ "name" => config_field_name, "label" => config_field_label }, resource) do

    if Map.has_key?(resource, config_field_name) do
      [
        %{
          name: config_field_name,
          label: config_field_label,
          value: get_in(resource, [config_field_name])
        }
      ]
    else
      []
    end
  end

  defp scan_and_add(scan, config_items, resource) do
    Enum.reduce(config_items, [],
      fn config_item, out_items ->
        out_items ++ apply(scan, [config_item, resource])
      end
    )
  end
end
