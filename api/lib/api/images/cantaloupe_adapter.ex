defmodule Api.Images.CantaloupeAdapter do
  use Tesla

  plug Tesla.Middleware.BaseUrl, Core.Config.get(:cantaloupe_url)

  adapter Tesla.Adapter.Ibrowse

  def get(project, id) do
    result = get("%2F#{project}%2F#{id}/full/\!380,350/0/default.jpg")
    case result do
      {:ok, %{ body: error, status: 404 }} -> {:error, error}
      {:ok, %{ body: image_data }} -> {:ok, image_data}
      other -> IO.puts ": #{inspect other}"
    end
  end
end
