defmodule Api.Documents.MockIndex do

  def search(_, _, _, _, _, _) do
    %{ hits: [] }
  end
end
