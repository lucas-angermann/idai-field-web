defmodule Api.Server do
  use Plug.Router
  
  plug :match

  plug(Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Poison
  )

  plug :dispatch
  
  plug :send_json

  forward("/resources", to: Api.Router)

  match _ do
    send_resp(conn, 404, "Requested page not found!")
  end

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]}
    }
  end

  def start_link(_opts),
    do: Plug.Adapters.Cowboy2.http(__MODULE__, [])

  defp send_json(%Plug.Conn{ resp_body: resp_body, status: status } = conn, _opts) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(status, Poison.encode!(resp_body))
  end

end