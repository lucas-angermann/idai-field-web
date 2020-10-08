defmodule Worker.Enricher.Enricher do
  alias Worker.Enricher.Gazetteer
  alias Worker.Enricher.Relations
  alias Worker.Enricher.Labels
  alias Worker.Enricher.Children
  require Logger

  def process(changes, project, get_for_id, configuration) do
    process_changes(changes, project, get_for_id, configuration)
    |> Children.add_children_counts
  end

  defp process_changes(changes, project, get_for_id, configuration) do
    Enum.map(changes, &process_change(&1, project, get_for_id, configuration))
  end

  defp process_change(change = %{ deleted: true }, _project, _get_for_id, _configuration), do: change
  defp process_change(change, project, get_for_id, configuration) do
    try do
      change
      |> Gazetteer.add_coordinates
      |> Relations.add_child_of_relations
      |> Relations.expand(get_for_id)
      |> Labels.add_labels(configuration)
      |> put_in([:doc, :project], project)
    rescue
      error -> Logger.error "Enrichment failed for resource #{change.doc.resource.id}: "
               <> "#{ if error.message do error.message else inspect(error) end }"
      nil
    end
  end
end
