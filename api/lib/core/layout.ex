
defmodule Core.Layout do

  def get_layout(doc, %{ "groups" => config_groups }) do

    doc = put_in(doc, [:resource, "groups"], [])

    Enum.reduce(config_groups, doc,
      fn config_group, doc ->
        object_group = scan_group config_group, doc
        update_in(doc, [:resource, "groups"], append(object_group))
      end
    )
  end

  defp scan_group(config_group, doc) do

    %{
      "fields" => config_group_fields,
      "name" => config_group_name,
      "relations" => config_group_relations
    } = config_group

    fields =
      Enum.reduce(config_group_fields, [],
       fn config_group_field, fields ->
         field = scan_field(config_group_field, doc)
         append(field).(fields)
       end
      )

    relations = Enum.reduce(config_group_relations, [],
      fn config_group_relation, relations ->
        relation = scan_relation(config_group_relation, doc)
        append(relation).(relations)
      end
    )

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

    if Map.has_key?(get_in(doc.resource, ["relations"]), config_relation_name) do
      %{
        name: config_relation_name,
        targets: get_in(doc.resource, ["relations", config_relation_name])
      }
    else
      nil
    end
  end

  defp scan_field(%{ "name" => config_field_name }, doc) do

    if Map.has_key?(doc.resource, config_field_name) do
      %{
        name: config_field_name,
        value: get_in(doc.resource, [config_field_name])
      }
    else
      nil
    end
  end

  defp append(nil), do: fn list -> list end

  defp append(item), do: fn list -> list ++ [item] end
end
