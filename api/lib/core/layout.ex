
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

  # TODO see if we find fields in resource which are in that group
  # if there are none return [group], otherwise return []
  defp scan_group(doc, groups) do
    [0]
  end
end
