defmodule Worker.Controller do
  require Logger

  alias Worker.Indexer
  alias Worker.Mapper
  alias Worker.Services.IdaiFieldDb
  alias Worker.Enricher.Enricher
  alias Core.ProjectConfigLoader

  def process do
    for db <- Core.Config.get(:projects), do: process(db)
  end
  def process(db) do
    pid = spawn_link fn -> process_db(db) end
    Logger.info "Spawned indexer #{inspect pid} for #{db}"
    pid
  end

  def process_db(db) do
    configuration = ProjectConfigLoader.get(db)

    {new_index, old_index} = Indexer.create_new_index_and_set_alias db

    IdaiFieldDb.fetch_changes(db)
    |> Enum.filter(&filter_non_owned_document/1)
    |> Enum.map(Mapper.process)
    |> log_finished("mapping", db)
    |> Enricher.process(db, IdaiFieldDb.get_doc(db), configuration)
    |> log_finished("enriching", db)
    |> Enum.map(Indexer.process(db, new_index))
    |> log_finished("indexing", db)

    Indexer.add_alias_and_remove_old_index db, new_index, old_index
  end

  def log_finished(change, step, db) do
    Logger.info "Finished #{step} #{db}"
    change
  end

  defp filter_non_owned_document(_change = %{ doc: %{ project: _project } }), do: false
  defp filter_non_owned_document(_change), do: true
end
