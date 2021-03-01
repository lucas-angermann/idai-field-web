defmodule Api.Worker.Router do
  require Logger
  use Plug.Router
  import Api.RouterUtils, only: [send_json: 2]
  alias Api.Worker.Server
  alias Api.Core.Config

  plug :match
  plug Api.Auth.AdminRightsPlug
  plug :dispatch

  post "/update_mapping" do
    {status, msg} = Server.update_mapping()
    send_json(conn, %{ status: status, message: msg})
  end

  # 1. Updates the mapping template.
  # 2. Reindexes all projects.
  post "/reindex" do
    {_status, _msg} = Server.update_mapping()
    {status, msg} = Server.reindex(Config.get(:projects))
    send_json(conn, %{ status: status, message: msg })
  end

  # 1. Reindexes a single project.
  post "/reindex/:project" do
    {status, msg} = Server.reindex([project])
    send_json(conn, %{ status: status, message: msg })
  end
  
  post "/tasks/stop/:project" do
    {status, msg} = Server.stop_task project
    send_json(conn, %{ status: status, message: msg })
  end
  
  get "/tasks/show" do
    {status, msg} = Server.show_tasks()
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
    send_json(conn, %{ status: status, message: msg })
  end

  post "/convert" do
    {status, msg} = Server.convert(Config.get(:projects))
    send_json(conn, %{ status: status, message: msg })
  end

  post "/convert/:project" do
    {status, msg} = Server.convert([project])
    send_json(conn, %{ status: status, message: msg })
  end
end
