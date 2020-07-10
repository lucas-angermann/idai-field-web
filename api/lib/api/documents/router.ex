defmodule Api.Documents.Router do
  use Plug.Router
  alias Api.Documents.Index
  import Api.RouterUtils, only: [send_json: 2]
  import Core.Layout

  plug :match
  plug :dispatch

  get "/", do: send_json(conn, Index.search(
    conn.params["q"] || "*",
    conn.params["size"] || 100,
    conn.params["from"] || 0,
    conn.params["filters"],
    conn.params["not"],
    conn.params["exists"]
  ))

  get "/map", do: send_json(conn, Index.search_geometries(
    conn.params["q"] || "*",
    conn.params["filters"],
    conn.params["not"],
    conn.params["exists"]
  ))

  get "/:id" do
    Index.get(id)
    |> to_layouted_document
    |> (&(send_json(conn, &1))).()
  end
end
