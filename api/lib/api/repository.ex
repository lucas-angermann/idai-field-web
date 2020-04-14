defmodule Api.Repository do
  import Utils

  def list_resources do

    case HTTPoison.get("localhost:9200/idai-field/resource/_search") do

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        Poison.decode!(body)
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

    case HTTPoison.get("localhost:9200/idai-field/resource/" <> id) do

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        Poison.decode!(body)
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