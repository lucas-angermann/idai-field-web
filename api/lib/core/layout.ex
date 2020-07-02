
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

  defp scan_group(%{ "fields" => config_group_fields }, doc) do

    fields =
      Enum.reduce(config_group_fields, [],
       fn config_group_field, fields ->

         field = scan_field(config_group_field, doc)
         append(field).(fields)
       end
      )

    if length(fields) == 0 do
      nil
    else
      %{ fields: fields }
    end
  end

  defp scan_field(config_field, _doc) do
    0
  end

  defp append(nil), do: fn list -> list end

  defp append(item), do: fn list -> list ++ [item] end
end
