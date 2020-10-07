defmodule Worker.Router do
  use Plug.Router
  import RouterUtils, only: [send_json: 2]

  plug :match
  plug :dispatch

  post "/update_mapping" do
    Worker.Indexer.update_mapping_template()
    send_json(conn, %{ status: "ok", message: "Start updating mapping template"})
  end

  post "/reindex" do
    Task.async fn -> Worker.Worker.process() end
    send_json(conn, %{ status: "ok", message: "Start indexing all projects"})
  end

  post "/reindex/:project" do
    Task.async fn -> Worker.Worker.process(project) end
    send_json(conn, %{ status: "ok", message: "Start indexing '#{project}'"})
  end

  post "/tiling" do
    Task.async fn -> Worker.Services.Tiles.trigger_tile_calculation() end
    send_json(conn, %{ status: "ok", message: "tile generation started"})
  end
end