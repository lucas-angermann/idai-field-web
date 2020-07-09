defmodule Api.Documents.Map do
  import Api.Documents.Helper
  alias Api.Documents.Mapping
  alias Api.Documents.Query

  @max_size 10000

  def by(q, filters, must_not, exists) do

    q = if !q do "*" else q end

    query = Query.init(q, @max_size)
    |> Query.add_filters(filters)
    |> Query.add_must_not(must_not)
    |> Query.add_exists(exists)
    |> Query.build()

    handle_result HTTPoison.post(
      "#{get_base_url()}/_search",
      query,
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
