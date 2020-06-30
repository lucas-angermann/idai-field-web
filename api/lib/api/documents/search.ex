defmodule Api.Documents.Search do
  import Api.Documents.Helper
  alias Api.Documents.Mapping
  alias Api.Documents.Query

  def by(q, size, from, filters, must_not, exists) do
    q = if !q do "*" else q end
    size = if !size do 100 else size end
    from = if !from do 0 else from end
    handle_result HTTPoison.post(
      "#{get_base_url()}/_search",
      Query.build(q, size, from, filters, must_not, exists),
      [{"Content-Type", "application/json"}]
    )
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    body
    |> to_atomized_result
    |> Mapping.map
  end
  defp handle_result({:ok, %HTTPoison.Response{status_code: 400, body: body}}) do
    IO.inspect body
    %{error: "bad_request"}
  end
  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    %{error: "unknown"}
  end
end
