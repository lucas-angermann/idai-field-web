defmodule Worker.Router do
  require Logger
  use Plug.Router
  import RouterUtils, only: [send_json: 2]

  plug :match
  plug :dispatch

  post "/publish/:project" do
    Task.async fn ->
      pid = Worker.WorkerController.process(project)
      Process.monitor pid
      receive do
        _ -> Logger.info "Convert images for '#{project}'"
             Worker.Images.ImageMagickImageConverter.convert_files(project) # todo this should be done via a controller
             Logger.info "Generate tiles for '#{project}'"
             Worker.Images.TilesController.trigger_tile_calculation([project])
      end
    end
    send_json(conn, %{ status: "ok", message: "Start publishing '#{project}'"})
  end

  post "/update_mapping" do
    Worker.Indexer.update_mapping_template()
    send_json(conn, %{ status: "ok", message: "Start updating mapping template"})
  end

  post "/reindex" do
    Task.async fn -> Worker.WorkerController.process() end
    send_json(conn, %{ status: "ok", message: "Start indexing all projects"})
  end

  post "/reindex/:project" do
    Task.async fn -> Worker.WorkerController.process(project) end
    send_json(conn, %{ status: "ok", message: "Start indexing '#{project}'"})
  end

  # Prerequisite: Run reindex, run conversion
  post "/tiling" do
    Task.async fn -> Worker.Images.TilesController.trigger_tile_calculation() end
    send_json(conn, %{ status: "ok", message: "Tile generation started"})
  end

  # Prerequisite: Run reindex, run conversion
  post "/tiling/:project" do
    Task.async fn -> Worker.Images.TilesController.trigger_tile_calculation([project]) end
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
