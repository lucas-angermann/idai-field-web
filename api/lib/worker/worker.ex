defmodule Worker do
  require Logger

  def process do

    Indexer.update_mapping_template()

    for db <- Core.Config.get(:couchdb_databases) do
      pid = spawn_link fn -> process_db(db) end
      Logger.info "Spawned indexer #{inspect pid} for #{db}"
    end
  end

  def process_db(db) do
    Harvester.fetch_changes(db)
    |> Enum.map(Mapper.process)
    |> log_finished("mapping", db)
    |> Enum.map(Enricher.process(db))
    |> log_finished("enriching", db)
    |> Enum.map(Indexer.process(db))
    |> log_finished("indexing", db)
  end

  def log_finished(change, step, db) do
    Logger.info "Finished #{step} #{db}"
    change
  end
end
