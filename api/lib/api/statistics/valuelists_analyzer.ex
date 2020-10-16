defmodule Api.Statistics.ValuelistsAnalyzer do
  alias Core.Config

  def find_overlapping_valuelists(valuelists) do
    Enum.reduce(Config.get(:couchdb_databases), %{}, fn project_name, result ->
      Map.put(result, project_name, find_overlapping_valuelists(valuelists, project_name))
    end)
  end
  def find_overlapping_valuelists(valuelists, project_name) do
    Enum.reduce(valuelists, %{}, &add_to_overlapping_info(&1, &2, project_name, valuelists))
    |> Enum.into(%{})
  end

  defp add_to_overlapping_info({ valuelist_name, valuelist }, overlapping_info, project_name, valuelists) do
    overlapping = find_overlapping_valuelists(valuelist_name, valuelist, project_name, valuelists)
    if length(overlapping) > 0 do
      Map.put(overlapping_info, valuelist_name, overlapping)
    else
      overlapping_info
    end
  end

  defp find_overlapping_valuelists(valuelist_name, valuelist, project_name, valuelists) do
    used_values = get_used_values(valuelist, project_name)
    if (length(used_values) > 0) do
      Enum.filter(valuelists, fn { name, valuelist } ->
        name != valuelist_name && contains_values(valuelist, used_values)
      end)
      |> Enum.map(fn { valuelist_name, _ } -> valuelist_name end)
    else
      []
    end
  end

  defp get_used_values(%{ values: values }, project_name) do
    Enum.filter(values, fn { _, counts } ->
      Map.has_key?(counts, project_name) && counts[project_name] > 0
    end)
    |> Enum.map(fn { value_name, _ } -> value_name end)
  end

  defp contains_values(valuelist, values) do
    length(values -- Map.keys(valuelist.values)) == 0
  end
end
