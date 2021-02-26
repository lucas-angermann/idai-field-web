defmodule Api.Worker.Router do
  require Logger
  use Plug.Router
  import Api.RouterUtils, only: [send_json: 2]
  alias Api.Worker.IndexAdapter
  alias Api.Worker.Server
  alias Api.Core.Config

  plug :match
  plug Api.Auth.AdminRightsPlug
  plug :dispatch

  post "/update_mapping" do
    IndexAdapter.update_mapping_template()
    send_json(conn, %{ status: "ok", message: "Start updating mapping template"})
  end

  # 1. Updates the mapping template.
  # 2. Reindexes all projects.
  post "/reindex" do
    IndexAdapter.update_mapping_template()
    {status, msg} = Server.index_projects(Config.get(:projects))
    send_json(conn, %{ status: status, message: msg })
  end

  get "/reindex" do
    {status, msg} = Server.show_running()
    send_json(conn, %{ status: status, message: msg })
  end

  # 1. Reindexes a single project.
  post "/reindex/:project" do
    {status, msg} = Server.index_projects([project])
    send_json(conn, %{ status: status, message: msg })
  end

  post "/reindex/:project/stop" do
    {status, msg} = Server.stop_index_project(project)
    send_json(conn, %{ status: status, message: msg })
  end

  # Prerequisite: Reindex
  post "/tiling" do
    Task.async fn -> Api.Worker.Images.TilesController.make_tiles() end
    send_json(conn, %{ status: "ok", message: "Tile generation started"})
  end

  # Prerequisite: Project is indexed
  post "/tiling/:project" do
    Task.async fn -> Api.Worker.Images.TilesController.make_tiles([project]) end
    send_json(conn, %{ status: "ok", message: "Tile generation started for '#{project}'"})
  end

  post "/conversion" do
    Task.async fn -> Api.Worker.Images.ConversionController.convert_images_for_all_projects() end
    send_json(conn, %{ status: "ok", message: "Started to convert all images of all projects"})
  end

  post "/conversion/:project" do
    Task.async fn -> Api.Worker.Images.ConversionController.convert_images_for_project(project) end
    send_json(conn, %{ status: "ok", message: "Started to convert all images of '#{project}'"})
  end
end
