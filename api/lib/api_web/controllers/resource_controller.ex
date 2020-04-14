defmodule ApiWeb.ResourceController do
  use ApiWeb, :controller

  alias Api.Repository

  def index(conn, _params) do
    resources = Repository.list_resources()
    render(conn, "index.json", resources: resources)
  end
end