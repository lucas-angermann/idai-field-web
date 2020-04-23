defmodule Api.Resources.Helper do
  import Api.Utils
  alias Api.Config

  def get_base_url, do: "#{Config.get(:elasticsearch_url)}/#{Config.get(:elasticsearch_index)}"

  def to_atomized_result(body), do: body |> Poison.decode! |> atomize

  def to_hits(%{ hits: %{ hits: hits }}), do: hits

  def to_resource(%{ _source: %{ resource: resource } }), do: resource
end