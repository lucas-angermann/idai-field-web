defmodule Api.Config do

  @config %{
    elasticsearch_url: "localhost:9200",
    elasticsearch_index: "idai-field"
  }

  def get, do: @config
end