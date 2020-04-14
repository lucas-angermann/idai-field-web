defmodule Api.Repository do

  def list_resources do

    case HTTPoison.get("localhost:9200/idai-field/resource/_search") do

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        %{ "hits" => %{ "hits" => hits }} = Poison.decode! body
        hits
             |> Enum.map(fn hit -> {:ok, result} = Map.fetch(hit, "_source"); result end)
             |> Enum.map(fn hit -> {:ok, result} = Map.fetch(hit, "resource"); result end)
             |> Enum.map(fn hit -> for {key, val} <- hit, into: %{}, do: {String.to_atom(key), val} end)

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
        %{ "_source" => %{ "resource" => resource }} = Poison.decode! body
        for {key, val} <- resource, into: %{}, do: {String.to_atom(key), val}

      {:ok, %HTTPoison.Response{status_code: 404}} ->
        %{"type" => "null", "identifier" => "0"}

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.inspect reason
        %{"type" => "null", "identifier" => "0"}
    end
  end
end