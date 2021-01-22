defmodule Api.Shapes.Router do
  use Plug.Router
  alias Api.Shapes.Index
  import RouterUtils
  import Core.Layout

  plug :match
  plug Api.Auth.ReadableProjectsPlug
  plug :dispatch

  post "/similarity" do
    send_json(conn, Index.search_similar(
      conn.params["model"],
      conn.params["query_vector"],
      conn.params["size"] || 10,
      conn.private[:readable_projects]
    ))
  end

end
