defmodule Api.Documents.Router do
  use Plug.Router
  alias Api.Documents.Get
  alias Api.Documents.Search
  import Api.RouterUtils, only: [send_json: 2]

  plug :match
  plug :dispatch

  get "/", do: send_json(conn, Search.by(
    conn.params["q"],
    conn.params["size"],
    conn.params["from"],
    conn.params["filters"],
    conn.params["not"]
  ))

  get "/:id", do: send_json(conn, Get.by(id))
end
