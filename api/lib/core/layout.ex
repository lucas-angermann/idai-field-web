
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

  defp scan_group(%{ "fields" => config_group_fields }, _doc) do

    object_group = %{
      fields: []
    }

    object_group = Enum.reduce(config_group_fields, object_group,
       fn config_group_field, object_group ->

         # field = fetch_field(object_group)
         update_in(object_group, [:fields], append(0))
       end
    )

    object_group # TODO if fields is empty return nil, otherwise group
  end

  defp append(nil), do: fn list -> list end

  defp append(item), do: fn list -> list ++ [item] end
end
