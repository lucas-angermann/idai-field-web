defmodule Api.Images.Router do
  require Logger
  use Plug.Router
  import Api.RouterUtils
  alias Plug.Conn

  plug :match
  #plug Api.Documents.ReadableProjectsPlug
  plug :dispatch

  get "/:project/:id/:token/*params" do

    path_info = Enum.drop conn.path_info, 3
    # IO.puts "path_info #{Path.join(path_info)}"

    readable_projects = ["meninx-project"] #conn.private[:readable_projects]
    project = "meninx-project"

    if String.contains?(List.first(path_info), "info.json") do
      with :ok <- access_for_project_allowed(readable_projects, project),
           {:ok, image_info} <- images_adapter().info(project, id) do
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, image_info)
      else
        :unauthorized_access -> send_unauthorized(conn)
        {:error, :not_found} -> send_not_found(conn)
        {:error, reason} -> send_error(conn, reason)
      end
    else
      with :ok <- access_for_project_allowed(readable_projects, project),
          {:ok, image_data} <- images_adapter().get(project, id, Path.join(path_info)) do
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
  end

  defp images_adapter do
    if Mix.env() == :test do
      Api.Images.MockImagesAdapter
    else
      Api.Images.CantaloupeImagesAdapter
    end
  end
end
