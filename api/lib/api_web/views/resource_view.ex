defmodule ApiWeb.ResourceView do
  use ApiWeb, :view
  alias ApiWeb.ResourceView

  def render("index.json", %{resources: resources}) do
    %{data: render_many(resources, ResourceView, "resource.json")}
  end

  def render("resource.json", %{resource: %{ "type" => type, "identifier" => identifier }}) do
    %{type: type,
      identifier: identifier}
  end
end