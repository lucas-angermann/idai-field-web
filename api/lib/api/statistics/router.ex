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
      overlapping: %{
        total: ValuelistsAnalyzer.find_overlapping_valuelists(valuelists, false),
        used: ValuelistsAnalyzer.find_overlapping_valuelists(valuelists, true),
      }
     }
    send_json(conn, result)
  end

  get "/valuelists/:project_name" do
    valuelists = ValuelistsCollector.get_for_project(project_name)
    result = %{
      valuelists: valuelists,
      overlapping: %{
        total: ValuelistsAnalyzer.find_overlapping_valuelists(valuelists, project_name, false),
        used: ValuelistsAnalyzer.find_overlapping_valuelists(valuelists, project_name, true)
      }
    }
    send_json(conn, result)
  end
end
