defmodule Api.Documents.Helper do
  alias Api.Config

  def get_base_url, do: "#{Config.get(:elasticsearch_url)}/#{Config.get(:elasticsearch_index)}"

  def to_document(%{ "_source" => document }), do: document
end
