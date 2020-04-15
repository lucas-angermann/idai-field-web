defmodule Api.Resources.Repository do
  import Api.Utils
  alias Api.Config

  def search_resources(nil), do: search_resources("*")

  def search_resources(q) do

    case HTTPoison.get("#{Config.elasticsearch_url}/#{Config.elasticsearch_index}/resource/_search", [],
           params: %{q: q}) do

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        body
        |> Poison.decode!
        |> atomize
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

    case HTTPoison.get("#{Config.elasticsearch_url}/#{Config.elasticsearch_index}/resource/#{id}") do

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        body
        |> Poison.decode!
        |> atomize
        |> to_resource

      {:ok, %HTTPoison.Response{status_code: 404}} ->
        %{type: "null", identifier: "0"}

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.inspect reason
        %{type: "null", identifier: "0"}
    end
  end


  defp to_hits(%{ hits: %{ hits: hits }}), do: hits

  defp to_resource(%{ _source: %{ resource: resource } }), do: resource
end