defmodule Harvester do
  alias Worker.Config

  def fetch_changes do
    auth = [hackney: [basic_auth: {Config.get(:couchdb_user), Config.get(:couchdb_password)}]]
    handle_result HTTPoison.get("#{Config.get(:couchdb_url)}/#{Config.get(:couchdb_database)}/_changes?include_docs=true", %{}, auth)
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    %{"results" => results} = Poison.decode!(body, as: %{"results" => [%Types.Change{}]})
    results
  end
  
end