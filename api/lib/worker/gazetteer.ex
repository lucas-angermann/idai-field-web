defmodule Gazetteer do
  alias Worker.Config

  defguard is_ok(status_code) when status_code >= 200 and status_code < 300

  defguard is_error(status_code) when status_code >= 400

  def get_place(gazetteer_id) do
    handle_result HTTPoison.get("#{Config.get(:gazetteer_url)}/doc/#{gazetteer_id}.json")
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
       when is_ok(status_code) do

    Poison.decode!(body)
  end

  defp handle_result({:ok, %HTTPoison.Response{status_code: status_code, body: body}})
       when is_error(status_code) do

    IO.puts "ERROR: Failed to fetch gazetteer place, result: #{inspect body}"
    nil
  end

  defp handle_result({:error, %HTTPoison.Error{reason: reason}}) do

    IO.puts "ERROR: Failed to fetch gazetteer place, reason: #{inspect reason}"
    nil
  end
end
