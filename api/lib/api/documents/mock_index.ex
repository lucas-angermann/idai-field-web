defmodule Api.Documents.MockIndex do

  def get(id) do
    %{
      project: "a",
      resource: %{
        id: "1",
        identifier: "ident1",
        category: "Operation",
        groups: []
      }
    }
  end
end
