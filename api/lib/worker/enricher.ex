defmodule Enricher do

    def process(change = %{deleted: true}, _project), do: change

    def process(change, project) do
        put_in change.doc.project, project
    end

end
