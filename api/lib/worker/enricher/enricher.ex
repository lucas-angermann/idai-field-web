defmodule Enricher.Enricher do
  alias Enricher.Gazetteer
  alias Enricher.Relations

  # todo add test
  def process(project, get_for_id), do: fn change -> process(change, project, get_for_id) end
  def process(change = %{deleted: true}, _project, _get_for_id), do: change
  def process(change, project, get_for_id) do
    change
    |> Gazetteer.add_coordinates
    |> Relations.expand(get_for_id)
    |> put_in([:doc, :project], project)
  end
end
