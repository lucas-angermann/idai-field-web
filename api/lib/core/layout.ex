
defmodule Core.Layout do

  def get_layout(doc, %{ "groups" => groups }) do

    doc = put_in(doc, [:resource, "groups"], [])

    Enum.reduce(groups, doc,
      fn group, doc ->

        update_in(doc, [:resource, "groups"],
          fn groups ->

            # TODO see if we find fields in resource which are in that group
            # if there are none return groups, otherwise attach a new group to groups
            groups ++ [0]
          end
        )
      end
    )
  end
end
