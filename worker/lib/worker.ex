defmodule Worker do
  @moduledoc """
  Documentation for `Worker`.
  """

  def process do
    Indexer.index Harvester.fetch_all_documents()
  end
end
