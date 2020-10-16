defmodule Api.Statistics.Router do
  use Plug.Router
  import RouterUtils
  alias Api.Statistics.ValuelistsCollector
  alias Api.Statistics.ValuelistsAnalyzer

  plug :match
  plug :dispatch

  get "/valuelists" do
    valuelists = ValuelistsCollector.get_for_all
    result = %{
      valuelists: valuelists,
      overlapping: ValuelistsAnalyzer.find_overlapping_valuelists(valuelists)
     }
    send_json(conn, result)
  end

  get "/valuelists/:project_name" do
    valuelists = ValuelistsCollector.get_for_project(project_name)
    result = %{
      valuelists: valuelists,
      overlapping: ValuelistsAnalyzer.find_overlapping_valuelists(valuelists, project_name)
    }
    send_json(conn, result)
  end
end
