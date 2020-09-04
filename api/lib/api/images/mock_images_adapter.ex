defmodule Api.Images.MockImagesAdapter do
  def get(_, id) do
    if id == "non-existing-doc" do
      {:error, :not_found}
    else
      {:ok, ""}
    end
  end
end
