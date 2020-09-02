defmodule Api.Images.CantaloupeAdapter do
  use Tesla

  plug Tesla.Middleware.BaseUrl, "http://localhost:8182/iiif/2/"

  adapter Tesla.Adapter.Ibrowse

  def get() do
    get("%2Fmeninx-project%2F24b62f8d-f8fc-b7f8-05c5-77454c6289b5/full/\!380,350/0/default.jpg")
  end
end