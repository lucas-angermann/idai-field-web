defmodule Api.Images.CantaloupeImagesAdapter do
  require Logger
  use Tesla
  plug Tesla.Middleware.BaseUrl, Core.Config.get(:cantaloupe_url)
  adapter Tesla.Adapter.Ibrowse

  def get(project, id, cantaloupe_params) do
    cantaloupe_url = "%2F#{project}%2F#{id}/full/#{cantaloupe_params}/default.jpg"
    result = get(cantaloupe_url)
    case result do
      {:ok, %{ body: image_data, status: 200 }} -> {:ok, image_data}
      {:ok, %{ body: _, status: 404 }} -> {:error, :not_found}
      {:ok, %{ body: error, status: _status }} -> {:error, error}
      other -> Logger.error ": #{inspect other}"; {:error, "Unknown error (see server logs)"}
    end
  end
end
