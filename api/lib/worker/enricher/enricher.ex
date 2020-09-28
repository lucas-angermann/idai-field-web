defmodule Worker.Enricher.Enricher do
  alias Worker.Enricher.Gazetteer
  alias Worker.Enricher.Relations
  alias Worker.Enricher.Labels
  require Logger

  def process(project, get_for_id, configuration), do:
    fn change -> process(change, project, get_for_id, configuration) end
  def process(change = %{ deleted: true }, _project, _get_for_id, _configuration), do: change
  def process(change, project, get_for_id, configuration) do
    try do
      change
      |> Gazetteer.add_coordinates
      |> Relations.expand(get_for_id)
      |> Labels.add_labels(configuration)
      |> put_in([:doc, :project], project)
    rescue
      error -> Logger.error "Enrichment failed for resource #{change.doc.resource.id}: #{error.message}"
      nil
    end
  end
end
