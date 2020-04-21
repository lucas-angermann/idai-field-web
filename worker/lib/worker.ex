defmodule Worker do
  @moduledoc """
  Documentation for `Worker`.
  """

  def process do
    %{"results" => results} = Harvester.fetch_all_documents()
    Indexer.index results
  end
end
