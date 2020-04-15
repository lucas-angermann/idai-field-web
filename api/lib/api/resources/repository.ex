defmodule Api.Resources.Repository do
  import Api.Utils
  alias Api.Config

  @get_base_url "#{Config.get.elasticsearch_url}/#{Config.get.elasticsearch_index}/resource"

  def search_resources(nil), do: search_resources("*")

  def search_resources(q) do
    handle_search_resources HTTPoison.get("#{@get_base_url}/_search", [], params: %{q: q})
  end

  def get_resource(id) do
    handle_get_resource HTTPoison.get("#{@get_base_url}/#{id}")
  end

  defp handle_search_resources({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    body
    |> to_atomized_result
    |> to_hits
    |> Enum.map(&to_resource/1)
  end

  defp handle_search_resources({:ok, %HTTPoison.Response{status_code: 404}}) do
    []
  end

  defp handle_search_resources({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    []
  end

  defp handle_get_resource({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
     body
     |> to_atomized_result
     |> to_resource
  end

  defp handle_get_resource({:ok, %HTTPoison.Response{status_code: 404}}) do
     %{type: "null", identifier: "0"}
  end

  defp handle_get_resource({:error, %HTTPoison.Error{reason: reason}}) do
     IO.inspect reason
     %{type: "null", identifier: "0"}
  end

  defp to_atomized_result(body), do: body |> Poison.decode! |> atomize

  defp to_hits(%{ hits: %{ hits: hits }}), do: hits

  defp to_resource(%{ _source: %{ resource: resource } }), do: resource
end