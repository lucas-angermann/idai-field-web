defmodule Api.Images.FilesystemAdapter do

  def get(project, id) do
    path = "/opt/src/api/images/#{project}/#{id}"
    IO.puts path
    {:ok, content} = File.read(path)
    {:ok, %{body: content}}
  end
end