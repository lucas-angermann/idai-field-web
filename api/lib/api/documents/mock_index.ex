defmodule Api.Documents.MockIndex do

  def search(_, _, _, _, _, _) do
    %{ hits: [] }
  end

  def get(id) do
    case id do
      "doc-of-proj-a" ->
        %{
          project: "a",
          resource: %{
            id: "1",
            identifier: "ident1",
            category: "Operation",
            groups: []
          }
        }
      "doc-of-proj-b" ->
        %{
          project: "b",
          resource: %{
            id: "2",
            identifier: "ident2",
            category: "Operation",
            groups: []
          }
        }
    end
  end
end
