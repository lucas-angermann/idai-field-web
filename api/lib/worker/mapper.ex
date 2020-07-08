defmodule Mapper do

    def process(change = %{ doc: %{ resource: %{ type: "Project" }}}) do
        id = change.doc.resource.identifier
        change = put_in(change.doc.resource.id, id)
        put_in(change.id, id)
    end

    def process(change), do: change

end
