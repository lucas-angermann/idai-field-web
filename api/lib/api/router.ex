defmodule Api.Router do
  use Plug.Router
  alias Api.Repository

  plug :match

  plug :dispatch

  get "/", do: resp(conn, 200, Repository.list_resources())

  get "/:id", do: resp(conn, 200, Repository.get_resource(id))

end