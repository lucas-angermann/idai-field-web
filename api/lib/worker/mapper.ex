defmodule Mapper do

  def process, do: fn change -> process(change) end
  def process(change = %{ doc: %{ resource: %{ type: "Project" }}}) do

    id = change.doc.resource.identifier
    change = put_in(change.doc.resource.id, id)
    put_in(change.id, id)
    |> rename_type_to_category
  end
  def process(change = %{deleted: true}), do: change
  def process(change), do: change |> rename_type_to_category |> convert_period

  defp rename_type_to_category(change) do
    {category, new_change} = pop_in(change[:doc][:resource][:type])
    put_in(new_change, [:doc, :resource, :category], category)
  end
  
  defp convert_period(change = %{ doc: %{ resource: resource }}) do
    if resource[:period] == nil or is_map(resource[:period]) do
      change
    else
      put_in(change, [:doc, :resource, :period], %{ value: resource.period })
    end
  end
end
