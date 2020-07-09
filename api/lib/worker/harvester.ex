defmodule Harvester do
  alias Worker.Config
  import Core.CorePropertiesAtomizing

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def fetch_changes(db) do
    auth = [hackney: [basic_auth: {Config.get(:couchdb_user), Config.get(:couchdb_password)}]]
    handle_result HTTPoison.get("#{Config.get(:couchdb_url)}/#{db}/_changes?include_docs=true", %{}, auth)
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_ok(status_code) do

    Poison.decode!(body)["results"]
    |> format_changes
    |> update_in([Access.all(), :doc], &(Map.drop(&1, [:"_id"])))
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_error(status_code) do

    IO.puts "#{inspect self()} - ERROR: Failed to retrieve changes, result: #{inspect body}"
    nil
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do

    IO.puts "#{inspect self()} - ERROR: Failed to retrieve changes, reason: #{inspect reason}"
    nil
  end
end
