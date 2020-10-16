defmodule Api.Statistics.Router do
  use Plug.Router
  import RouterUtils
  import Core.Layout
  alias Api.Statistics.Valuelists

  plug :match
  plug :dispatch

  get "/valuelists" do
    send_json(conn, Valuelists.get_for_all)
  end

  get "/valuelists/:project_name" do
    send_json(conn, Valuelists.get_for_project(project_name))
  end
end
