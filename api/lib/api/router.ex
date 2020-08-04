defmodule Api.Router do
  use Plug.Router
  import Api.RouterUtils, only: [send_json: 2]

  plug :match

  plug(Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Poison
  )

  plug :dispatch

  forward("/api/documents", to: Api.Documents.Router)

  forward("/api/images", to: Api.Images.Router)

  post "/api/reindex" do
    Task.async fn -> Worker.process() end
    send_json(conn, %{ status: "ok", message: "indexing started"})
  end

  forward("/api/auth", to: Api.Auth.Router)

  match _ do
    send_resp(conn, 404, "Requested page not found!")
  end

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]}
    }
  end

  def start_link(_opts) do
    Plug.Cowboy.http(__MODULE__, [])
  end
end
