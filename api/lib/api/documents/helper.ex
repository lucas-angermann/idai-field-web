defmodule Api.Documents.Helper do

  def get_base_url, do: "#{Application.fetch_env!(:api, :elasticsearch_url)}/#{Application.fetch_env!(:api, :elasticsearch_index)}"

end
