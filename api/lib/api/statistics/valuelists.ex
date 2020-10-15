defmodule Api.Statistics.Valuelists do
  alias Core.ProjectConfigLoader
  alias Api.Documents.Query
  alias Api.Documents.Mapping
  require Logger

  def get_for_project(project_name) do
    config = ProjectConfigLoader.get(project_name)
    get_category_map(config)
    |> Enum.reduce(%{}, &search_for_category(&1, &2, config, project_name))
  end

  defp get_category_map(config) do
    Enum.reduce(config, %{}, &get_category_map/2)
  end
  defp get_category_map(%{ item: item, trees: trees }, category_map) do
    category_map = Map.put(category_map, item.name, get_valuelist_fields(item.groups))
    Enum.reduce(trees, category_map, &get_category_map/2)
  end

  defp get_valuelist_fields(groups) do
    Enum.reduce(groups, [], fn group, fields ->
      fields ++ Enum.filter(group.fields, fn field -> Map.has_key?(field, :valuelist) end)
    end)
  end

  defp search_for_category({ category_name, fields }, result_map, config, project_name) do
    filters = get_filters(fields)

    result = Query.init("*", 0, 0)
    |> Query.add_aggregations(filters)
    |> Query.add_filters([{ "resource.category.name", [category_name] }, { "project", [project_name] }])
    |> build_post_atomize
    |> Mapping.map(config, filters)

    if Map.has_key?(result, :filters) do
      Enum.reduce(result.filters, result_map, &add_to_result_map(&1, &2, fields))
    else
      result_map
    end
  end

  defp add_to_result_map(aggregation, result_map, fields) do
    field_name = String.replace(aggregation.name, "resource.", "")
                 |> String.replace(".name", "")
                 |> String.replace(".value", "")
                 |> String.replace(".endValue", "")
    field_definition = Enum.find(fields, fn f -> f.name == field_name end)

    if Map.has_key?(result_map, field_definition.valuelist.id) do
      result_map = update_in(result_map[field_definition.valuelist.id].count, fn count -> count + get_total_count(aggregation) end)
      update_in(result_map[field_definition.valuelist.id].values, fn values -> update_values(aggregation, values, field_definition) end)
    else
      Map.put(result_map, field_definition.valuelist.id, %{
        count: get_total_count(aggregation),
        values: get_values(aggregation, field_definition)
      })
    end
  end

  defp get_total_count(%{ values: buckets }) do
    Enum.map(buckets, fn bucket -> bucket.count end)
    |> Enum.sum
  end

  defp get_values(%{ values: buckets }, field_definition) do
    Enum.reduce(Map.keys(field_definition.valuelist["values"]), %{}, fn value, map ->
      bucket = Enum.find(buckets, fn b -> b.value.name == value end)
      Map.put(map, value, %{ count: if bucket do bucket.count else 0 end })
    end)
  end

  defp update_values(%{ values: buckets }, value_map, field_definition) do
    Enum.reduce(Map.keys(field_definition.valuelist["values"]), value_map, fn value, map ->
      bucket = Enum.find(buckets, fn b -> b.value.name == value end)
      if bucket do
        Map.update(map, value, %{ count: bucket.count }, fn previous ->
          Map.put(previous, :count, previous.count + bucket.count)
        end)
      else
        map
      end
    end)
  end

  defp get_filters(fields), do: Enum.reduce(fields, [], fn field, filters -> filters ++ get_filter(field) end)

  defp get_filter(field = %{ inputType: "dropdownRange" }) do
    [
      %{
        field: "resource.#{field.name}.value",
        label: %{},
        labeled_value: true,
        size: 100000
      },
      %{
        field: "resource.#{field.name}.endValue",
        label: %{},
        labeled_value: true,
        size: 100000
      }
    ]
  end
  defp get_filter(field) do
    [
      %{
        field: "resource.#{field.name}",
        label: %{},
        labeled_value: true,
        size: 100000
      }
    ]
  end

  defp build_post_atomize(query) do
    query
    |> Query.build
    |> index_adapter().post_query
    |> Core.Utils.atomize_up_to(:_source)
  end

  defp index_adapter() do
    if Mix.env() == :test do
      Api.Documents.MockIndexAdapter
    else
      Api.Documents.ElasticsearchIndexAdapter
    end
  end
end
