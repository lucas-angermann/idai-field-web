defmodule ApiWeb.ResourceController do
  use ApiWeb, :controller

  def index(conn, _params) do
    resources = [%{type: "abc", identifier: 123}]
    render(conn, "index.json", resources: resources)
  end
end