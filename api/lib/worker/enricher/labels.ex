defmodule Enricher.Labels do
  alias Core.Utils

  def add_labels(change = %{ doc: %{ resource: resource } }, category_definition) do
    put_in(
      change.doc.resource,
      Enum.map(resource, &(add_labels_to_field(&1, category_definition)))
      |> Enum.into(%{})
      |> Utils.atomize
    )
  end

  defp add_labels_to_field({ :category, field_value }, category_definition) do
    { :category, %{ name: field_value, label: category_definition.label } }
  end
  defp add_labels_to_field({ field_name, field_value }, category_definition) do
    if Enum.member?([:id, :identifier, :relations, :geometry, :geometry_wgs84, :georeference], field_name) do
      { field_name, field_value }
    else
      case field_value do
        [_|_] -> { field_name, Enum.map(field_value, &get_value_with_label(field_name, &1, category_definition)) }
        _ -> { field_name, get_value_with_label(field_name, field_value, category_definition) }
      end
    end
  end

  defp get_value_with_label(field_name, dimension = %{ "measurementPosition" => position }, category_definition) do
    label = get_label(field_name, position, category_definition, :positionValues)
    if !is_nil(label) do
      put_in(dimension["measurementPosition"], %{ name: position, label: label })
    else
      dimension
    end
  end
  defp get_value_with_label(field_name, field_value, category_definition) do
    label = get_label(field_name, field_value, category_definition, :valuelist)
    if !is_nil(label) do
      %{ name: field_value, label: label }
    else
      field_value
    end
  end

  defp get_label(field_name, field_value, category_definition, valuelist_property_name) do
     field_definition = get_field_definition(category_definition, field_name)
     cond do
      is_nil(field_definition) || !Map.has_key?(field_definition, valuelist_property_name) -> nil
      Map.has_key?(field_definition[valuelist_property_name]["values"], field_value) ->
        get_labels_object(field_definition[valuelist_property_name]["values"][field_value])
      true -> %{}
     end
  end

  defp get_field_definition(category_definition, field_name) do
    group = Enum.find(category_definition.groups, &get_field_definition_from_group(&1, field_name))
    get_field_definition_from_group(group, field_name)
  end

  defp get_field_definition_from_group(%{ fields: fields }, field_name) do
    Enum.find(fields, fn field -> field.name == field_name end)
  end
  defp get_field_definition_from_group(_, _), do: nil

  defp get_labels_object(%{ "labels" => labels }), do: labels
  defp get_labels_object(_), do: %{}

end
