defmodule Enricher.Enricher do
  alias Enricher.Gazetteer
  alias Enricher.Relations
  alias Enricher.Labels
  alias Core.CategoryTreeList
  require Logger

  def process(project, get_for_id, configuration), do:
    fn change -> process(change, project, get_for_id, configuration) end
  def process(change = %{deleted: true}, _project, _get_for_id, _configuration), do: change
  def process(change, project, get_for_id, configuration) do
    category = CategoryTreeList.find_by_name(change.doc.resource.category, configuration)
    if is_nil(category) do
      Logger.error "Failed to process resource #{change.doc.resource.id}: Category #{change.doc.resource.category} not
        found in configuration."
      nil
    else
      try do
        change
        |> Gazetteer.add_coordinates
        |> Relations.expand(get_for_id)
        |> Labels.add_labels(category)
        |> put_in([:doc, :project], project)
      rescue
        error -> Logger.error(error.message)
        nil
      end
    end
  end
end
