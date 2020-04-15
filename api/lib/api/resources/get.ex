defmodule Api.Resources.Get do
  import Api.Resources.Resources

  def by(id) do
    handle_get_resource HTTPoison.get("#{get_base_url}/#{id}")
  end

  defp handle_get_resource({:ok, %HTTPoison.Response{status_code: 200, body: body}}) do
    body
    |> to_atomized_result
    |> to_resource
  end

  defp handle_get_resource({:ok, %HTTPoison.Response{status_code: 404}}) do
    %{type: "null", identifier: "0"}
  end

  defp handle_get_resource({:error, %HTTPoison.Error{reason: reason}}) do
    IO.inspect reason
    %{type: "null", identifier: "0"}
  end
end