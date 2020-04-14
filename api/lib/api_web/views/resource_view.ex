defmodule ApiWeb.ResourceView do
  use ApiWeb, :view
  alias ApiWeb.ResourceView

  def render("index.json", %{resources: resources}) do
    %{data: render_many(resources, ResourceView, "resource.json")}
  end

  def render("resource.json", %{resource: resource}) do
    %{
      id: resource.id,
      type: resource.type,
      identifier: resource.identifier,
      shortDescription: resource.shortDescription
    }
  end
end