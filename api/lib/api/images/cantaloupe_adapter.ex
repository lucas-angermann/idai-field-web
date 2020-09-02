defmodule Api.Images.CantaloupeAdapter do
  use Tesla

  plug Tesla.Middleware.BaseUrl, "http://localhost:8182/iiif/2/"

  adapter Tesla.Adapter.Ibrowse

  def get(project, id) do
    get("%2F#{project}%2F#{id}/full/\!380,350/0/default.jpg")
  end
end