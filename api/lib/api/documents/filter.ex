defmodule Api.Documents.Filter do

  def parse(nil), do: nil
  def parse(filter_strings = [_|_]), do: Enum.map(filter_strings, &parse_filter_string/1)

  def expand(filters = [_|_]), do: Enum.flat_map(filters, &expand_filter/1)

  defp parse_filter_string(filter_string), do: String.split(filter_string, ":") |> List.to_tuple

  defp expand_filter({"resource.category.name", value}) do
    [{"resource.category.name", value}]
  end
  defp expand_filter({field, value}), do: [{field, value}]
end
