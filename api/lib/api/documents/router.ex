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
    with doc <- Index.get(id),
         config <- Core.ProjectConfigLoader.get(doc.project),
         layouted_doc <- put_in(doc.resource, to_layouted_resource(config, doc.resource))
    do
      send_json(conn, layouted_doc)
    end
  end
end
