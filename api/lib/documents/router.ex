defmodule Api.Documents.Router do
  use Plug.Router
  alias Api.Documents.Index
  alias Api.Documents.Predecessors
  alias Api.Documents.DescendantsImages
  import Api.RouterUtils
  import Api.Core.Layout

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

  match "/project" do
    with {:ok, document} <- get_document(conn.params["selected_id"], conn.private[:readable_projects]),
         {:ok, predecessors_start_document} <- get_document(conn.params["predecessors_id"], conn.private[:readable_projects])
    do
      search_result = if conn.params["query"] !== nil do 
        Index.search(
          conn.params["query"]["q"] || "*",
          conn.params["query"]["size"] || 100,
          conn.params["query"]["from"] || 0,
          conn.params["query"]["filters"],
          conn.params["query"]["not"],
          conn.params["query"]["exists"],
          conn.params["query"]["not_exists"],
          conn.params["query"]["sort"],
          conn.params["query"]["vector_query"],
          conn.private[:readable_projects]
        ) else nil
      end
      map_search_result = if conn.params["query"] !== nil do
        Index.search_geometries(
          conn.params["query"]["q"] || "*",
          conn.params["query"]["filters"],
          conn.params["query"]["not"],
          conn.params["query"]["exists"],
          conn.params["query"]["not_exists"],
          conn.private[:readable_projects]
        ) else nil
      end
      result = %{
        search: search_result,
        map: map_search_result,
        selected: document,
        predecessors: Predecessors.get(predecessors_start_document)
      }
      send_json(conn, result)
    else
      :not_found -> send_not_found(conn)
      :unauthorized_access -> send_unauthorized(conn)
      :other_error -> IO.puts "other error"
    end
  end

  defp get_document(id, readable_projects) do
    with doc = %{ project: project, resource: resource } <- Index.get(id),
         :ok <- access_for_project_allowed(readable_projects, project),
         config <- Api.Core.ProjectConfigLoader.get(project),
         layouted_doc <- put_in(doc.resource, to_layouted_resource(config, resource))
    do
      {:ok, layouted_doc}
    else
      nil -> {:ok, nil}
      :unauthorized_access -> :unauthorized_access
      _ -> :other_error
    end
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
    case get_document(id, conn.private[:readable_projects]) do 
      {:ok, nil} -> send_not_found(conn)
      {:ok, doc} -> send_json(conn, doc)
      :unauthorized_access -> send_unauthorized(conn)
      :other_error -> IO.puts "other error"
    end
  end

  get "/predecessors/:id" do
    with doc = %{ project: project } <- Index.get(id),
         :ok <- access_for_project_allowed(conn.private[:readable_projects], project)
    do
      send_json(conn, %{ results: Predecessors.get(doc) })
    else
      nil -> send_not_found(conn)
      :unauthorized_access -> send_unauthorized(conn)
      _ -> IO.puts "other error"
    end
  end

  get "/descendantsImages/:id/:numberOfImages" do
    with doc = %{ project: project } <- Index.get(id),
         :ok <- access_for_project_allowed(conn.private[:readable_projects], project)
    do
      send_json(conn, %{ results: DescendantsImages.get(
        doc, elem(Integer.parse(numberOfImages), 0), conn.private[:readable_projects]
      )})
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
      "query_vector" => get_in(doc, [:resource, :relations ,:isDepictedIn, Access.at(0) ,:resource, :featureVectors, model])
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
end
