defmodule Api.Resources.Router do
  use Plug.Router
  alias Api.Resources.Get
  alias Api.Resources.Search
  import Api.RouterUtils, only: [send_json: 2]

  plug :match
  plug :dispatch

  get "/", do: send_json(conn, Search.by(conn.params["q"], conn.params["size"]))
  get "/:id", do: send_json(conn, Get.by(id))
end