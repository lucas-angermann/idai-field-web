defmodule Api.Images.Router do
  require Logger
  use Plug.Router
  import RouterUtils
  alias Plug.Conn
  alias Api.Documents.Index

  plug :match
  plug Api.Auth.ReadableProjectsPlug
  plug :dispatch

  get "/similar/:model/:id" do
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
      conn.params["not"],
      conn.params["exists"],
      conn.params["not_exists"],
      conn.params["sort"],
      vector_query,
      conn.private[:readable_projects]
    ))
  end

  get "/:project/:id/:token/*params" do
    readable_projects = Api.Auth.Bearer.get_user_for_bearer(token).readable_projects
    with :ok <- access_for_project_allowed(readable_projects, project) do
      handle_call conn, project, id
    else
      :unauthorized_access -> RouterUtils.send_unauthorized conn
    end
  end

  defp handle_call(conn, project, id) do
    path_info = Enum.drop conn.path_info, 3

    if String.contains?(List.first(path_info), "info.json") do
      with {:ok, image_info} <- images_adapter().info(project, id) do
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, image_info)
      else
        {:error, :not_found} -> send_not_found(conn)
        {:error, reason} -> send_error(conn, reason)
      end
    else
      with {:ok, image_data} <- images_adapter().get(project, id, Path.join(path_info)) do
        conn
        |> put_resp_content_type("image/jpeg")
        |> put_resp_header("cache-control", "max-age=86400, private, must-revalidate")
        |> send_resp(200, image_data)
      else
        {:error, :not_found} -> send_not_found_image(conn)
        {:error, reason} -> send_error(conn, reason)
      end
    end
  end

  defp send_not_found_image(conn) do
    conn
    |> put_resp_content_type("image/png")
    |> put_resp_header("cache-control", "max-age=86400, private, must-revalidate")
    |> Conn.send_file(200, "resources/not_found.png")
  end

  defp images_adapter do
    if Mix.env() == :test do
      Api.Images.MockImagesAdapter
    else
      Api.Images.CantaloupeImagesAdapter
    end
  end
end
