defmodule Api.Documents.Router do
  use Plug.Router
  alias Api.Documents.Index
  import Api.RouterUtils
  import Core.Layout

  plug :match
  plug Api.Documents.ReadableProjectsPlug
  plug :dispatch

  get "/" do
    send_json(conn, Index.search(
      conn.params["q"] || "*",
      conn.params["size"] || 100,
      conn.params["from"] || 0,
      conn.params["filters"],
      conn.params["not"],
      conn.params["exists"],
      conn.private[:readable_projects]
    ))
  end

  get "/map" do
    send_json(conn, Index.search_geometries(
      conn.params["q"] || "*",
      conn.params["filters"],
      conn.params["not"],
      conn.params["exists"],
      conn.private[:readable_projects]
    ))
  end

  get "/:id" do
    with doc <- Index.get(id),
         :ok <- access_for_project_allowed(conn.private[:readable_projects], doc.project),
         config <- Core.ProjectConfigLoader.get(doc.project),
         layouted_doc <- put_in(doc.resource, to_layouted_resource(config, doc.resource))
    do
      send_json(conn, layouted_doc)
    else
      :unauthorized_access -> send_unauthorized(conn)
      _ -> IO.puts "other error"
    end
  end

  defp access_for_project_allowed readable_projects, project do
    if project in readable_projects, do: :ok, else: :unauthorized_access
  end

  defp get_readable_projects conn do
    (conn
     |> get_req_header("authorization")
     |> List.first
     |> Api.Auth.Router.get_user_for_bearer).readable_projects
  end
end
