defmodule Harvester do
  alias Worker.Config

  def fetch_all_documents do
    auth = [hackney: [basic_auth: {Config.get(:couchdb_user), Config.get(:couchdb_password)}]]
    handle_result HTTPoison.get("#{Config.get(:couchdb_url)}/types-list-test/_changes?include_docs=true", %{}, auth)
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