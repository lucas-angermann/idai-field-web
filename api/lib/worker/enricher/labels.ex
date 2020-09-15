defmodule Enricher.Labels do
  alias Core.CategoryTreeList
  alias Core.Utils

  def add_labels(change = %{ doc: %{ resource: resource } }, configuration) do
    category = CategoryTreeList.find_by_name(resource.category, configuration)
    put_in(
      change.doc.resource,
      Enum.map(resource, &(add_labels_to_field(&1, configuration, category)))
      |> Enum.into(%{})
      |> Utils.atomize
    )
  end

  defp add_labels_to_field({ :category, field_value }, configuration, category) do
    { :category, %{ name: field_value, label: category.label } }
  end
  defp add_labels_to_field({ field_name, field_value }, configuration, category) do
    if Enum.member?([:id, :identifier, :relations, :geometry, :georeference], field_name) do
      { field_name, field_value }
    else
      case field_value do
        [_|_] -> { field_name, Enum.map(field_value, &get_value_with_label(field_name, &1, category)) }
        _ -> { field_name, get_value_with_label(field_name, field_value, category) }
      end
    end
  end

  defp get_value_with_label(field_name, dimension = %{ "measurementPosition" => position }, category) do
    put_in(
      dimension["measurementPosition"],
      %{ name: position, label: get_label(field_name, position, category, :positionValues) }
    )
  end
  defp get_value_with_label(field_name, field_value, category) do
    %{ name: field_value, label: get_label(field_name, field_value, category, :valuelist) }
  end

  defp get_label(field_name, field_value, category, valuelist_property_name) do
     field_definition = get_field_definition(category, field_name)
     if !is_nil(field_definition) && Map.has_key?(field_definition, valuelist_property_name)
        && Map.has_key?(field_definition[valuelist_property_name]["values"], field_value) do
       field_definition[valuelist_property_name]["values"][field_value]["labels"]
     else
       %{}
     end
  end

  defp get_field_definition(category, field_name) do
    group = Enum.find(category.groups, &get_field_definition_from_group(&1, field_name))
    get_field_definition_from_group(group, field_name)
  end

  defp get_field_definition_from_group(%{ fields: fields }, field_name) do
    Enum.find(fields, fn field -> field.name == field_name end)
  end
  defp get_field_definition_from_group(_, _), do: nil

end
