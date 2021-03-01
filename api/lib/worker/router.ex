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
    {status, msg} = Server.reindex(Config.get(:projects))
    send_json(conn, %{ status: status, message: msg })
  end

  # 1. Reindexes a single project.
  post "/reindex/:project" do
    {status, msg} = Server.reindex([project])
    send_json(conn, %{ status: status, message: msg })
  end
  
  post "/stop_process/:project" do
    {status, msg} = Server.stop_process project
    send_json(conn, %{ status: status, message: msg })
  end
  
  get "/show_processes" do
    {status, msg} = Server.show_processes()
    send_json(conn, %{ status: status, message: msg })
  end

  # Prerequisite: Reindex
  post "/tilegen" do
    {status, msg} = Server.tilegen(Config.get(:projects))
    send_json(conn, %{ status: status, message: msg})
  end

  # Prerequisite: Project is indexed
  post "/tilegen/:project" do
    {status, msg} = Server.tilegen([project])
    send_json(conn, %{ status: status, message: msg})
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
