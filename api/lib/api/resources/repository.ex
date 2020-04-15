defmodule Api.Resources.Repository do
  import Api.Utils
  alias Api.Config

  @get_base_url "#{Config.get.elasticsearch_url}/#{Config.get.elasticsearch_index}/resource"

  def search_resources(nil), do: search_resources("*")

  def search_resources(q) do

    case HTTPoison.get("#{@get_base_url}/_search",
           [], params: %{q: q}) do

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        body
        |> to_atomized_result
        |> to_hits
        |> Enum.map(&to_resource/1)

      {:ok, %HTTPoison.Response{status_code: 404}} ->
        []

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.inspect reason
        []
    end
  end

  def get_resource(id) do

    case HTTPoison.get("#{@get_base_url}/#{id}") do

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        body
        |> to_atomized_result
        |> to_resource

      {:ok, %HTTPoison.Response{status_code: 404}} ->
        %{type: "null", identifier: "0"}

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.inspect reason
        %{type: "null", identifier: "0"}
    end
  end

  defp to_atomized_result(body) do
    body
    |> Poison.decode!
    |> atomize
  end

  defp to_hits(%{ hits: %{ hits: hits }}), do: hits

  defp to_resource(%{ _source: %{ resource: resource } }), do: resource
end