defmodule Mapper do

  def process, do: fn change -> process(change) end
  def process(change = %{ doc: %{ resource: %{ type: "Project" }}}) do

    id = change.doc.resource.identifier
    change = put_in(change.doc.resource.id, id)
    put_in(change.id, id)
    |> rename_type_to_category
  end
  def process(change = %{deleted: true}), do: change
  def process(change), do: change |> rename_type_to_category

  defp rename_type_to_category(change) do
    {category, new_change} = pop_in(change[:doc][:resource][:type])
    put_in(new_change, [:doc, :resource, :category], category)
  end
end
