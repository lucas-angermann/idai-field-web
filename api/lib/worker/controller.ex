defmodule Worker.Controller do
  require Logger

  alias Worker.IndexAdapter
  alias Worker.Mapper
  alias Worker.Services.IdaiFieldDb
  alias Worker.Enricher.Enricher
  alias Core.ProjectConfigLoader
  alias Core.Config

  @doc """
  For all configured projects triggers reindexing.
  Every project gets indexed in its own Task.
  Returns (syncronously) after all Tasks have finished.

  While reindexing, every project, identified by its alias, a new index gets created.
  When reindexing for the project is finished, the alias will change to point to the new index 
  while the old index gets removed.
  """
  def process do
    raise "oops"
    processes = for db <- Config.get(:projects), do: process(db)
    Enum.map(processes, &Task.await(&1, :infinity))
  end
  def process(db) do
    pid = Task.async fn -> reindex(db) end
    Logger.info "Spawned indexer #{inspect pid} for #{db}"
    pid
  end

  defp reindex(db) do
    configuration = ProjectConfigLoader.get(db)

    {new_index, old_index} = IndexAdapter.create_new_index_and_set_alias db

    IdaiFieldDb.fetch_changes(db)
    |> Enum.filter(&filter_non_owned_document/1)
    |> Enum.map(Mapper.process)
    |> log_finished("mapping", db)
    |> Enricher.process(db, IdaiFieldDb.get_doc(db), configuration)
    |> log_finished("enriching", db)
    |> Enum.map(IndexAdapter.process(db, new_index))
    |> log_finished("indexing", db)

    IndexAdapter.add_alias_and_remove_old_index db, new_index, old_index
  end

  defp log_finished(change, step, db) do
    Logger.info "Finished #{step} #{db}"
    change
  end

  defp filter_non_owned_document(_change = %{ doc: %{ project: _project } }), do: false
  defp filter_non_owned_document(_change), do: true
end
