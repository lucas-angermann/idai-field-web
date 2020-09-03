defmodule Api.Images.Router do
  require Logger
  use Plug.Router
  import Api.RouterUtils

  plug :match
  plug Api.Documents.ReadableProjectsPlug
  plug :dispatch

  get "/:project/:id" do
    with :ok <- access_for_project_allowed(conn.private[:readable_projects], project),
        {:ok, %{body: image_data}} <- Api.Images.CantaloupeAdapter.get(project, id) do # todo let get return {:ok, body}
      conn
      |> put_resp_content_type("image/jpeg")
      |> put_resp_header("cache-control", "max-age=86400, private, must-revalidate")
      |> send_resp(200, image_data)
    else
      :unauthorized_access -> send_unauthorized(conn)
      {:error, reason} -> send_error(conn, "Error when reading file: #{reason |> :file.format_error}")
      unexpected -> Logger.error "unexpected #{inspect unexpected}"; send_error(conn, "Unknown error")
      # nil -> send_not_found(conn) # todo review
    end
  end
end
