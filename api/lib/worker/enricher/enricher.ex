defmodule Enricher.Enricher do
    alias Enricher.Gazetteer
    alias Enricher.Relations

    def process(project), do: fn change -> process(change, project) end
    def process(change = %{deleted: true}, _project), do: change
    def process(change, project) do
        put_in(change, [:doc, :project], project)
        |> Gazetteer.add_coordinates
        |> Relations.expand
    end
end
