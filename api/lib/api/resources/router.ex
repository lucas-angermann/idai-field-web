defmodule Api.Resources.Router do
  use Plug.Router
  alias Api.Resources.Repository
  import Api.RouterUtils, only: [send_json: 2]

  plug :match
  plug :dispatch

  get "/", do: send_json(conn, Repository.list_resources())
  get "/:id", do: send_json(conn, Repository.get_resource(id))
end