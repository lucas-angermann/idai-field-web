defmodule Api.Documents.Get do
  import Api.Documents.Helper
  import Core.Layout
  alias Core.ProjectConfigLoader
  alias Api.Config

  def by(id) do
    handle_result HTTPoison.get("#{get_base_url()}/_doc/#{id}")
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    document = body
    |> Poison.decode!
    |> to_document
    |> (fn document -> Core.Utils.atomize(document, [:resource]) end).()
    |> update_in(["resource"], fn resource -> Core.Utils.atomize(resource, [:id, :type, :identifier, :shortDescription], true) end)
    # TODO review core_properties_atomizing
    # TODO get rid of Change,Document,Resource,Action records
    # TODO we need to atomize fields and relations, but not recursively
    # TODO review resource, relations in layout.ex

    project_config = ProjectConfigLoader.load(Config.get(:config_dir), document.project)

    layouted = to_layouted_document(document, project_config)
    #IO.inspect layouted
    layouted
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 404}}) do
    %{error: "not_found"}
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    %{error: "unknown"}
  end
end
