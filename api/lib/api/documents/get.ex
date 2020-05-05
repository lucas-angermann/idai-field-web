defmodule Api.Documents.Get do
  import Api.Documents.Helper

  def by(id) do
    handle_result HTTPoison.get("#{get_base_url()}/_doc/#{id}")
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    body
    |> to_atomized_result
    |> to_document
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 404}}) do
    %{error: "not_found"}
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    %{error: "unknown"}
  end
end
