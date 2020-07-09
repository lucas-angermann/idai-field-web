defmodule Api.Documents.Get do
  import Api.Documents.Helper
  import Core.Layout
  alias Core.ProjectConfigLoader

  def by(id) do
    handle_result HTTPoison.get("#{get_base_url()}/_doc/#{id}")
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    document = body
    |> Poison.decode!
    |> get_in(["_source"])
    |> Core.CorePropertiesAtomizing.format_document

    project_config = ProjectConfigLoader.get(document.project)
    update_in(document, [:resource], to_layouted_resource(project_config))
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 404}}) do
    %{error: "not_found"}
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    %{error: "unknown"}
  end
end
