defmodule Api.Documents.Router do
  use Plug.Router
  alias Api.Documents.Get
  alias Api.Documents.Search
  import Api.RouterUtils, only: [send_json: 2]

  plug :match
  plug :dispatch

  get "/", do: send_json(conn, Search.by(
    conn.params["q"] || "*",
    conn.params["size"] || 100,
    conn.params["from"] || 0,
    conn.params["filters"],
    conn.params["not"],
    conn.params["exists"]
  ))

  get "/map", do: send_json(conn, Search.geometries_by(
    conn.params["q"] || "*",
    conn.params["filters"],
    conn.params["not"],
    conn.params["exists"]
  ))

  get "/:id", do: send_json(conn, Get.by(id))
end
