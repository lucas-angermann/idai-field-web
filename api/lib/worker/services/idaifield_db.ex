defmodule Services.IdaiFieldDb do
  require Logger

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def get_doc(db, id) do
    auth = [hackney: [basic_auth: {Core.Config.get(:couchdb_user), Core.Config.get(:couchdb_password)}]]
    handle_result HTTPoison.get("#{Core.Config.get(:couchdb_url)}/#{db}/#{id}", %{}, auth)
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_ok(status_code) do

    Poison.decode!(body)
    |> Core.CorePropertiesAtomizing.format_document
  end
  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
    when is_error(status_code) do

    Logger.error "Failed to retrieve document, result: #{inspect body}"
    nil
  end
  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do

    Logger.error "ERROR: Failed to retrieve document, reason: #{inspect reason}"
    nil
  end

end
