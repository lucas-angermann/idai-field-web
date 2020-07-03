defmodule Core.Layout do

  @core_fields ["id", "identifier", "shortDescription", "type", "geometry", "georeference", "groups"]

  def to_layouted_document(doc, %{ "de" => configuration }) do

    %{ "groups" => config_groups } = Core.CategoryTreeList.find_by_name(doc["resource"]["type"], configuration)
    doc = add_groups(doc, config_groups)

    update_in(doc, ["resource"], &(Map.take(&1, @core_fields)))
  end

  defp add_groups(doc, config_groups) do

    groups = scan_and_add(&scan_group/2, config_groups, put_in(doc, ["resource", "groups"], []))
    put_in(doc, ["resource", "groups"], groups)
  end

  defp scan_group(config_group, doc) do

    %{
      "fields" => config_group_fields,
      "name" => config_group_name,
      "relations" => config_group_relations
    } = config_group

    fields = scan_and_add(&scan_field/2, config_group_fields, doc)
    relations = scan_and_add(&scan_relation/2, config_group_relations, doc)

    if length(fields) == 0 and length(relations) == 0 do
      nil
    else
      %{
        fields: fields,
        relations: relations,
        name: config_group_name
      }
    end
  end

  defp scan_relation(%{ "name" => config_relation_name}, doc) do

    if Map.has_key?(get_in(doc["resource"], ["relations"]), config_relation_name) do
      %{
        name: config_relation_name,
        targets: get_in(doc["resource"], ["relations", config_relation_name])
      }
    else
      nil
    end
  end

  defp scan_field(%{ "name" => config_field_name }, doc) do

    if Map.has_key?(doc["resource"], config_field_name) do
      %{
        name: config_field_name,
        value: get_in(doc["resource"], [config_field_name])
      }
    else
      nil
    end
  end

  defp scan_and_add(scan_f, coll, doc) do
    Enum.reduce(coll, [],
      fn coll_item, out_coll ->
        append(out_coll, apply(scan_f, [coll_item, doc]))
      end
    )
  end

  defp append(list, nil), do: list
  defp append(list, item), do: list ++ [item]
end
