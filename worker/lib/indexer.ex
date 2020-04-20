defmodule Indexer do

  def index(documents) when is_list(documents) do
    for document <- documents, do: index document
  end

  def index(document) do
    IO.inspect document
  end
end