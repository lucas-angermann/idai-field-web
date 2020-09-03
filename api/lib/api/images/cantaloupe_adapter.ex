defmodule Api.Images.CantaloupeAdapter do
  use Tesla

  plug Tesla.Middleware.BaseUrl, Core.Config.get(:cantaloupe_url)

  adapter Tesla.Adapter.Ibrowse

  def get(project, id) do
    result = get("%2F#{project}%2F#{id}/full/\!380,350/0/default.jpg")
    case result do
      {:ok, %{ body: image_data, status: 200 }} -> {:ok, image_data}
      {:ok, %{ body: error, status: _status }} -> {:error, error}
      other -> IO.puts ": #{inspect other}"
    end
  end
end
