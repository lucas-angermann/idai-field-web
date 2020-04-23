defmodule Api.Config do

  @config %{
    elasticsearch_url: "elasticsearch:9200",
    elasticsearch_index: "idai-field"
  }

  def get, do: @config
end