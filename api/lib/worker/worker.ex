defmodule Worker.Worker do
  require Logger

  alias Worker.Indexer
  alias Worker.Mapper
  alias Worker.Services.IdaiFieldDb
  alias Worker.Enricher.Enricher
  alias Core.ProjectConfigLoader

  def process do
    for db <- Core.Config.get(:couchdb_databases), do: process(db)
  end
  def process(db) do
    pid = spawn_link fn -> process_db(db) end
    Logger.info "Spawned indexer #{inspect pid} for #{db}"
  end

  def process_db(db) do
    configuration = ProjectConfigLoader.get(db)

    IdaiFieldDb.fetch_changes(db)
    |> Enum.map(Mapper.process)
    |> log_finished("mapping", db)
    |> Enum.map(Enricher.process(db, IdaiFieldDb.get_doc(db), configuration))
    |> log_finished("enriching", db)
    |> Enum.map(Indexer.process(db))
    |> log_finished("indexing", db)
  end

  def log_finished(change, step, db) do
    Logger.info "Finished #{step} #{db}"
    change
  end
end
