defmodule ApiWeb.ResourceController do
  use ApiWeb, :controller

  alias Api.Repository


  def show(conn, %{"id" => id}) do
    resource = Repository.get_resource(id)
    render(conn, "resource.json", resource: resource)
  end


  def index(conn, _params) do
    resources = Repository.list_resources()
    render(conn, "index.json", resources: resources)
  end
end