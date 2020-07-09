defmodule Worker do
  alias Worker.Config

  def process do
    for db <- Config.get(:couchdb_databases) do
      pid = spawn_link fn -> process_db(db) end
      IO.puts "Spawned indexer #{inspect pid} for #{db}"
    end
  end

  def process_db(db) do
    Harvester.fetch_changes(db)
    |> Enum.map(&Mapper.process/1)
    |> Enum.map(&(Enricher.process(&1, db)))
    |> Enum.map(&Indexer.process/1)
  end

end
