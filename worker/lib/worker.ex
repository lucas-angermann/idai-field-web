defmodule Worker do
  @moduledoc """
  Documentation for `Worker`.
  """

  defmodule Action do
    @derive [Poison.Encoder]
    defstruct [:date, :user]
  end

  defmodule Resource do
    @derive [Poison.Encoder]
    defstruct [:id, :type, :relations]
  end

  defmodule Document do
    @derive [Poison.Encoder]
    defstruct [resource: %Resource{}, created: %Action{}, modified: [%Action{}]]
  end

  defmodule Change do
    @derive [Poison.Encoder]
    defstruct [:changes, :deleted, :id, :seq, doc: %Document{}]
  end

  def fetch_documents do
    handle_result HTTPoison.get("field.dainst.org/sync/meninx-project4/_changes?limit=10&include_docs=true")
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    IO.puts "body"
    result = Poison.decode!(body, as: %{"results" => [%Change{}]})
    IO.inspect result
    result
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 404}}) do
    nil
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    nil
  end
end
