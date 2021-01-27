defmodule Api.Documents.Predecessors do
    alias Api.Documents.Index

    def get(doc) do
        fetch_entries(doc) |> Enum.map(&to_predecessor/1) |> Enum.reverse()
    end

    defp fetch_entries(doc) do
        Stream.unfold(doc, fn
          nil -> nil
          current_doc -> {
            current_doc,
            if Map.has_key?(current_doc.resource, :parentId) && current_doc.resource.parentId != nil do
              Index.get(current_doc.resource.parentId)
            end
          }
        end)
    end

    defp to_predecessor(entry) do
        %{
          id: entry.resource.id,
          identifier: entry.resource.identifier,
          category: entry.resource.category["name"],
          isChildOf: entry.resource.parentId
        }
    end
end