defmodule Api.Repository do
  import Utils

  def list_resources do

    case HTTPoison.get("localhost:9200/idai-field/resource/_search") do

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        %{ hits: %{ hits: hits }} = atomize(Poison.decode! body)
        hits |> Enum.map(fn %{ _source: %{ resource: resource } } -> resource end)

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
        %{ _source: %{ resource: resource }} = atomize Poison.decode! body
        resource

      {:ok, %HTTPoison.Response{status_code: 404}} ->
        %{type: "null", identifier: "0"}

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.inspect reason
        %{type: "null", identifier: "0"}
    end
  end
end