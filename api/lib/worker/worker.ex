defmodule Worker do
  alias Worker.Config

  def process do
    for db <- Config.get(:couchdb_databases) do
      IO.puts "Reindexing data from database: #{db}"
      Harvester.fetch_changes(db)
      |> Enum.map(&Mapper.process/1)
      |> Enum.map(&(Enricher.process(&1, db)))
      |> Enum.map(&Indexer.process/1)
    end
  end

end
