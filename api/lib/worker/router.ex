defmodule Worker.Router do
  require Logger
  use Plug.Router
  import RouterUtils, only: [send_json: 2]

  plug :match
  plug Api.Auth.AdminRightsPlug
  plug :dispatch

  post "/publish/:project" do
    Task.async fn ->
      pid = Worker.Controller.process(project)
      Process.monitor pid
      receive do
        _ -> Worker.Images.ConversionController.convert_images_for_project(project)
             Worker.Images.TilesController.make_tiles([project])
      end
    end
    send_json(conn, %{ status: "ok", message: "Start publishing '#{project}'"})
  end

  post "/update_mapping" do
    Worker.Indexer.update_mapping_template()
    send_json(conn, %{ status: "ok", message: "Start updating mapping template"})
  end

  post "/reindex" do
    Task.async fn -> Worker.Controller.process() end
    send_json(conn, %{ status: "ok", message: "Start indexing all projects"})
  end

  post "/reindex/:project" do
    Task.async fn -> Worker.Controller.process(project) end
    send_json(conn, %{ status: "ok", message: "Start indexing '#{project}'"})
  end

  # Prerequisite: Run reindex, run conversion
  post "/tiling" do
    Task.async fn -> Worker.Images.TilesController.make_tiles() end
    send_json(conn, %{ status: "ok", message: "Tile generation started"})
  end

  # Prerequisite: Run reindex, run conversion
  post "/tiling/:project" do
    Task.async fn -> Worker.Images.TilesController.make_tiles([project]) end
    send_json(conn, %{ status: "ok", message: "Tile generation started for '#{project}'"})
  end

  post "/conversion" do
    Task.async fn -> Worker.Images.ConversionController.convert_images_for_all_projects() end
    send_json(conn, %{ status: "ok", message: "Started to convert all images of all projects"})
  end

  post "/conversion/:project" do
    Task.async fn -> Worker.Images.ConversionController.convert_images_for_project(project) end
    send_json(conn, %{ status: "ok", message: "Started to convert all images of '#{project}'"})
  end
end
