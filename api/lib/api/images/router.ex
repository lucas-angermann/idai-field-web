defmodule Api.Images.Router do
  require Logger
  use Plug.Router
  import Api.RouterUtils

  plug :match
  plug Api.Documents.ReadableProjectsPlug
  plug :dispatch

  get "/:project/:id/info" do
    with :ok <- access_for_project_allowed(conn.private[:readable_projects], project),
        {:ok, image_info} <- images_adapter().info(project, id) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, image_info)
    else
      :unauthorized_access -> send_unauthorized(conn)
      {:error, :not_found} -> send_not_found(conn)
      {:error, reason} -> send_error(conn, reason)
    end
  end

  get "/:project/:id/*params" do
    with :ok <- access_for_project_allowed(conn.private[:readable_projects], project),
        {:ok, image_data} <- images_adapter().get(project, id, params) do
      conn
      |> put_resp_content_type("image/jpeg")
      |> put_resp_header("cache-control", "max-age=86400, private, must-revalidate")
      |> send_resp(200, image_data)
    else
      :unauthorized_access -> send_unauthorized(conn)
      {:error, :not_found} -> send_not_found(conn)
      {:error, reason} -> send_error(conn, reason)
    end
  end

  defp images_adapter do
    if Mix.env() == :test do
      Api.Images.MockImagesAdapter
    else
      Api.Images.CantaloupeImagesAdapter
    end
  end
end
