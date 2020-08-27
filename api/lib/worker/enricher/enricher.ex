defmodule Enricher.Enricher do
  alias Enricher.Gazetteer
  alias Enricher.Relations
  alias Services.IdaiFieldDb

  def process(project), do: fn change -> process(change, project) end
  def process(change = %{deleted: true}, _project), do: change
  def process(change, project) do

    change
    |> Gazetteer.add_coordinates
    |> Relations.expand(IdaiFieldDb.get_doc(project))
    |> put_in([:doc, :project], project)
  end
end
