defmodule Harvester do
  alias Worker.Config

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def fetch_changes do
    auth = [hackney: [basic_auth: {Config.get(:couchdb_user), Config.get(:couchdb_password)}]]
    handle_result HTTPoison.get("#{Config.get(:couchdb_url)}/#{Config.get(:couchdb_database)}/_changes?include_docs=true", %{}, auth)
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}})
    when is_ok(status_code) do

    %{"results" => results} = Poison.decode!(body, as: %{"results" => [%Types.Change{}]})
    results
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_error(status_code) do

    IO.puts "ERROR: Failed to retrieve changes: #{change.id}, result: #{inspect body}"
    nil
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}) do

    IO.puts "ERROR: Failed to index: #{change.id}, reason: #{inspect reason}"
    nil
  end
end