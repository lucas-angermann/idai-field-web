
defmodule Core.Layout do

  def get_layout(doc, %{ "groups" => groups }) do

    doc = put_in(doc, [:resource, "groups"], [])

    Enum.reduce(groups, doc,
      fn group, doc ->

        update_in(doc, [:resource, "groups"],
          fn groups ->
            groups ++ scan_group group, doc
          end
        )
      end
    )
  end

  defp scan_group(%{ "fields" => fields }, _doc) do

    IO.inspect fields

    group = %{
      fields: []
    }
    # TODO add items for existing fields

    [group] # if fields is empty return [], otherwise [group]
  end
end
