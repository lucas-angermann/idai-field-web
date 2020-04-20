defmodule Harvester do

  def fetch_all_documents do
    handle_result HTTPoison.get("field.dainst.org/sync/meninx-project4/_changes?include_docs=true")
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    Poison.decode!(body, as: %{"results" => [%Types.Change{}]})
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 404}}) do
    nil
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    nil
  end
end