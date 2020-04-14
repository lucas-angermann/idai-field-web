defmodule Api.Repository do
  @moduledoc """
  The Repository context.
  """

  @doc """
  Returns the list of users.
  ## Examples
      iex> list_resources()
      [%Resource{}, ...]
  """
  def list_resources do

    case HTTPoison.get("localhost:9200/idai-field/resource/_search") do

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        %{ "hits" => %{ "hits" => hits }} = Poison.decode! body
        # IO.inspect hits
        hits
             |> Enum.map(fn hit -> {:ok, result} = Map.fetch(hit, "_source"); result  end)
             |> Enum.map(fn hit -> {:ok, result} = Map.fetch(hit, "resource"); result  end)

      {:ok, %HTTPoison.Response{status_code: 404}} ->
        IO.puts "Not found :("
        []

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.inspect reason
        []
    end

    # [%{type: "abc", identifier: 123}]
  end
end