defmodule Api.Documents.Router do
  use Plug.Router
  alias Api.Documents.Index
  import RouterUtils
  import Core.Layout

  plug :match
  plug Api.Auth.ReadableProjectsPlug
  plug :dispatch

  get "/" do
    send_json(conn, Index.search(
      conn.params["q"] || "*",
      conn.params["size"] || 100,
      conn.params["from"] || 0,
      conn.params["filters"],
      conn.params["not"],
      conn.params["exists"],
      conn.params["not_exists"],
      conn.params["sort"],
      conn.private[:readable_projects]
    ))
  end

  get "/map" do
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

  # TODO under construction
  get "/predecessors/:id" do
    with doc = %{ project: project } <- Index.get(id),
         :ok <- access_for_project_allowed(conn.private[:readable_projects], project)
    do
      collection = Stream.unfold(
        doc,
        fn current_doc ->
          case current_doc do
            nil -> nil
            current_doc ->
              if Map.has_key?(current_doc.resource, :parentId) && current_doc.resource.parentId != nil do
                parent_key = current_doc.resource.parentId
                parent = Index.get(parent_key)
                {current_doc, parent}
              else
                {current_doc, nil}
              end
          end
        end
      )
      |>Enum.to_list()

      send_json(conn,
        %{
          results: Enum.map(
            collection,
            fn item ->
              %{
                id: item.resource.id,
                identifier: item.resource.identifier,
                category: item.resource.category["name"],
                liesWithin: item.resource.parentId
              }
            end
          ) |> Enum.reverse
        })
    else
      nil -> send_not_found(conn)
      :unauthorized_access -> send_unauthorized(conn)
      _ -> IO.puts "other error"
    end
  end
end
