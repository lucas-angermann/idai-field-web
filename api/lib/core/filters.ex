defmodule Api.Core.Filters do

  def get_filters(), do: [
    %{
      field: "project",
      label: %{ de: "Projekt", en: "Project" },
      labeled_value: false
    },
    %{
      field: "resource.category",
      label: %{ de: "Kategorie", en: "Category" },
      labeled_value: true
    }
  ]

  def get_filter_name(filter) do
    if filter.labeled_value do
      "#{filter.field}.name"
    else
      filter.field
    end
  end
end
