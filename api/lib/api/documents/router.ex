defmodule Api.Documents.Router do
  use Plug.Router
  alias Api.Documents.Index
  import RouterUtils
  import Core.Layout

  plug :match
  plug Api.Auth.ReadableProjectsPlug
  plug :dispatch

  match "/" do
    send_json(conn, Index.search(
      conn.params["q"] || "*",
      conn.params["size"] || 100,
      conn.params["from"] || 0,
      conn.params["filters"],
      conn.params["not"],
      conn.params["exists"],
      conn.params["not_exists"],
      conn.params["sort"],
      conn.params["vector_query"],
      conn.private[:readable_projects]
    ))
  end

  match "/map" do
    send_json(conn, Index.search_geometries(
      conn.params["q"] || "*",
      conn.params["filters"],
      conn.params["not"],
      conn.params["exists"],
      conn.params["not_exists"],
      conn.private[:readable_projects]
    ))
  end

  get "/:id" do
    with doc = %{ project: project, resource: resource } <- Index.get(id),
         :ok <- access_for_project_allowed(conn.private[:readable_projects], project),
         config <- Core.ProjectConfigLoader.get(project),
         layouted_doc <- put_in(doc.resource, to_layouted_resource(config, resource))
    do
      send_json(conn, layouted_doc)
    else
      nil -> send_not_found(conn)
      :unauthorized_access -> send_unauthorized(conn)
      _ -> IO.puts "other error"
    end
  end

  get "/predecessors/:id" do
    with doc = %{ project: project } <- Index.get(id),
         :ok <- access_for_project_allowed(conn.private[:readable_projects], project)
    do
      send_json(conn, %{ results: fetch_entries(doc) |> Enum.map(&to_predecessor/1) |> Enum.reverse() })
    else
      nil -> send_not_found(conn)
      :unauthorized_access -> send_unauthorized(conn)
      _ -> IO.puts "other error"
    end
  end

  match "/similar/:model/:id" do
    doc = Index.get(id)
    vector_query = %{
      "model" => model,
      "query_vector" => get_in(doc, [:resource, "featureVectors", model])
    }
    send_json(conn, Index.search(
      conn.params["q"] || "*",
      conn.params["size"] || 10,
      conn.params["from"] || 0,
      conn.params["filters"],
      conn.params["not"] || ["resource.id:#{id}"],
      conn.params["exists"],
      conn.params["not_exists"],
      conn.params["sort"],
      vector_query,
      conn.private[:readable_projects]
    ))
  end

  defp to_predecessor(entry) do
    %{
      id: entry.resource.id,
      identifier: entry.resource.identifier,
      category: entry.resource.category["name"],
      isChildOf: entry.resource.parentId
    }
  end

  defp fetch_entries(doc) do
    Stream.unfold(doc, fn
      nil -> nil
      current_doc -> {
        current_doc,
        if Map.has_key?(current_doc.resource, :parentId) && current_doc.resource.parentId != nil do
          Index.get(current_doc.resource.parentId)
        end
      }
    end)
  end
end
