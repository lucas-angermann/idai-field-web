defmodule Worker.Indexer do
  require Logger
  alias Worker.IndexAdapter
  alias Worker.Mapper
  alias Worker.Services.IdaiFieldDb
  alias Worker.Enricher.Enricher
  alias Core.ProjectConfigLoader

  def reindex(project) do
    configuration = ProjectConfigLoader.get(project)

    # if (project == "wes") do
      # :timer.sleep(1000)
      # raise "raised"
    # end
    #IO.puts "slept"

    {new_index, old_index} = IndexAdapter.create_new_index_and_set_alias project

    IdaiFieldDb.fetch_changes(project)
    |> Enum.filter(&filter_non_owned_document/1)
    |> Enum.map(Mapper.process)
    |> log_finished("mapping", project)
    |> Enricher.process(project, IdaiFieldDb.get_doc(project), configuration)
    |> log_finished("enriching", project)
    |> Enum.map(IndexAdapter.process(project, new_index))
    |> log_finished("indexing", project)

    IndexAdapter.add_alias_and_remove_old_index project, new_index, old_index
    {:finished_reindex_project, project}
  end

  defp log_finished(change, step, project) do
    Logger.info "Finished #{step} #{project}"
    change
  end

  defp filter_non_owned_document(_change = %{ doc: %{ project: _project } }), do: false
  defp filter_non_owned_document(_change), do: true
end
