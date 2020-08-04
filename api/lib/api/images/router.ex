defmodule Api.Images.Router do
  use Plug.Router
  alias Api.Documents.Index
  import Api.RouterUtils

  plug :match
  plug Api.Documents.ReadableProjectsPlug
  plug :dispatch

  get "/:id" do
    with doc <- Index.get(id),
         :ok <- access_for_project_allowed(conn.private[:readable_projects], doc.project),
         {:ok, image_data} <- File.read("images/#{doc.project}/#{id}")
    do
      conn
      |> put_resp_content_type("image/jpeg")
      |> send_resp(200, image_data)
    else
      :unauthorized_access -> send_unauthorized(conn)
      {:error, reason} -> IO.puts "Error when reading file: #{reason}"
      _ -> IO.puts "other error"
    end
  end

end
