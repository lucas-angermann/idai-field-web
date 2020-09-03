defmodule Api.Images.CantaloupeAdapter do
  use Tesla

  plug Tesla.Middleware.BaseUrl, Core.Config.get(:cantaloupe_url)

  adapter Tesla.Adapter.Ibrowse

  def get(project, id) do
    get("%2F#{project}%2F#{id}/full/\!380,350/0/default.jpg")
  end
end