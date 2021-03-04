defmodule Api.Worker.Mapper do

  def process(project), do: fn change -> process(change, project) end
  def process(change = %{ doc: %{ resource: %{ type: "Project" }}}, _) do
    id = change.doc.resource.identifier
    change = put_in(change.doc.resource.id, id)
    put_in(change.id, id)
    |> rename_type_to_category
  end
  def process(change = %{ deleted: true }, _), do: change
  def process(change, project) do
    change
    |> rename_type_to_category
    |> convert_period
    |> replace_project_id_in_relation_targets(project)
  end

  defp rename_type_to_category(change = %{ doc: %{ resource: %{ type: _ } } }) do
    {category, new_change} = pop_in(change[:doc][:resource][:type])
    put_in(new_change, [:doc, :resource, :category], category)
  end
  defp rename_type_to_category(change), do: change
  
  defp convert_period(change = %{ doc: %{ resource: resource } }) do
    if resource["period"] == nil or is_map(resource["period"]) do
      change
    else
      {_, change} =
        change
        |> put_in([:doc, :resource, "period"],
             if resource["periodEnd"] == nil do
               %{ "value" => resource["period"] }
             else
               %{ "value" => resource["period"], "endValue" => resource["periodEnd"] }
             end)
        |> pop_in([:doc, :resource, "periodEnd"])
      change
    end
  end

  defp replace_project_id_in_relation_targets(change = %{ doc: %{ resource: %{ relations: relations } } }, project) do
    updated_relations = for { relation_name, targets } <- relations, into: %{}, do: {
      relation_name,
      Enum.map(targets, fn target -> if target == "project" do project else target end end)
    }
    put_in(change, [:doc, :resource, :relations], updated_relations)
  end
  defp replace_project_id_in_relation_targets(change, _), do: change
end
