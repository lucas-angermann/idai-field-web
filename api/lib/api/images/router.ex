defmodule Api.Images.Router do

  use Plug.Router
  alias Api.Documents.Index
  import Api.RouterUtils

  plug :match
  plug Api.Documents.ReadableProjectsPlug
  plug :dispatch

  get "/:project/:id" do
    with :ok <- access_for_project_allowed(conn.private[:readable_projects], project),
        {:ok, %{body: image_data}} <- get_image_source().get(project, id) do
      conn
      |> put_resp_content_type("image/jpeg")
      |> put_resp_header("cache-control", "max-age=86400, private, must-revalidate")
      |> send_resp(200, image_data)
    else
      {:error, reason} -> send_error(conn, "Error when reading file: #{reason |> :file.format_error}")
      :unauthorized_access -> send_unauthorized(conn)
      unexpected -> IO.puts "unexpected #{inspect unexpected}"; send_error(conn, "Unknown error")
      # nil -> send_not_found(conn) # todo review
    end
  end

  defp get_image_source() do
    if Core.Config.get(:image_source) == "cantaloupe" do
      Api.Images.CantaloupeAdapter
    else
      Api.Images.FilesystemAdapter
    end
  end
end
