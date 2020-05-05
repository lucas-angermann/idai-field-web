defmodule Api.Documents.Search do
  import Api.Documents.Helper

  def by(q, size, from) do
    q = if !q do "*" else q end
    size = if !size do 100 else size end
    from = if !from do 0 else from end
    handle_result HTTPoison.get("#{get_base_url()}/_search", [], params: %{q: q, size: size, from: from})
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    body
    |> to_atomized_result
    |> to_hits
    |> Enum.map(&to_document/1)
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 400}}) do
    %{error: "bad_request"}
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    %{error: "unknown"}
  end
end
