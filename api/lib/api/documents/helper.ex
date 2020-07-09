defmodule Api.Documents.Helper do
  alias Api.Config

  def get_base_url, do: "#{Config.get(:elasticsearch_url)}/#{Config.get(:elasticsearch_index)}"

end
