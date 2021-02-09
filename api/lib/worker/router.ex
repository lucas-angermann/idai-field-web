defmodule Worker.Router do
  require Logger
  use Plug.Router
  import RouterUtils, only: [send_json: 2]
  alias Worker.IndexAdapter
  alias Worker.Indexer

  plug :match
  plug Api.Auth.AdminRightsPlug
  plug :dispatch

  post "/publish/:project" do
    Task.async fn ->
      pid = Worker.Indexer.trigger(project)
      Process.monitor pid
      receive do
        _ -> Worker.Images.ConversionController.convert_images_for_project(project)
             Worker.Images.TilesController.make_tiles([project])
      end
    end
    send_json(conn, %{ status: "ok", message: "Start publishing '#{project}'"})
  end

  post "/update_mapping" do
    IndexAdapter.update_mapping_template()
    send_json(conn, %{ status: "ok", message: "Start updating mapping template"})
  end

  # 1. Updates the mapping template.
  # 2. Reindexes all projects.
  post "/reindex" do
    IndexAdapter.update_mapping_template()
    Indexer.trigger()
    send_json(conn, %{ status: "ok", message: "Start indexing all projects"})
  end

  # 1. Reindexes a single project.
  post "/reindex/:project" do
    Indexer.trigger(project)
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
