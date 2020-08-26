defmodule Enricher.Enricher do
  alias Enricher.Gazetteer
  alias Enricher.Relations
  alias Services.IdaiFieldDb

  def process(project), do: fn change -> process(change, project) end
  def process(change = %{deleted: true}, _project), do: change
  def process(change, project) do

    target_docs_map = get_target_docs(change.doc.resource, IdaiFieldDb.get_doc(project))

    change
    |> Gazetteer.add_coordinates
    |> Relations.expand(target_docs_map)
    |> put_in([:doc, :project], project)
  end

  defp get_target_docs(resource, get) do
    if resource.relations == nil do
      %{}
    else
      Enum.reduce(
        resource.relations,
        %{},
        fn {relation_name, relation_target_ids}, target_documents ->
          Enum.reduce(
            relation_target_ids,
            target_documents,
            fn relation_target_id, target_documents ->
              put_in(target_documents, [relation_target_id], get.(relation_target_id))
            end
          )
        end
      )
    end
  end
end
