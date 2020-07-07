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
    |> (fn document -> Core.Utils.atomize(document, [:resource, :relations, :shortDescription, :id, :type, :identifier], true) end).()
    # TODO review; maybe put to core_properties_atomizing

    IO.inspect document

    project_config = ProjectConfigLoader.load(Config.get(:config_dir), document.project)

    layouted = to_layouted_document(document, project_config)
    IO.inspect layouted
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
