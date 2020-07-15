defmodule Api.Documents.Query do

  def init(q, size), do: init(q, size, 0)

  def init(q, size, from) do
    build_query_template(q, size, from)
  end

  def track_total(query) do
    put_in(query, [:track_total_hits], true)
  end

  def add_aggregations(query) do
    Map.put(query, :aggs, Enum.map(Core.Config.get(:default_filters), &build_terms_aggregation/1) |> Enum.into(%{}))
  end

  def add_filters(query, nil), do: query
  def add_filters(query, filters) do
    filter = Enum.map(filters, &build_term_query/1)
    update_in(query.query.bool.filter, &(&1 ++ filter))
  end

  def add_must_not(query, nil), do: query
  def add_must_not(query, must_not) do
    put_in(query.query.bool.must_not, Enum.map(must_not, &build_term_query/1))
  end

  def add_exists(query, nil), do: query
  def add_exists(query, exists) do
    exists_filter = Enum.map(exists, &build_exists_query/1)
    update_in(query.query.bool.filter, &(&1 ++ exists_filter))
  end

  def only_fields(query, fields) do
    put_in(query, [:_source], fields)
  end

  def build(query) do
    Poison.encode!(query)
  end

  def show(query) do
    IO.puts Poison.encode!(query, pretty: true)
    query
  end

  defp build_query_template(q, size, from) do
    %{
      query: %{
        bool: %{
          must: %{
            query_string: %{
              query: q
            }
          },
          filter: [],
          must_not: []
        }
      },
      size: size,
      from: from
    }
  end

  defp build_term_query(fieldAndValue) do
    [field, value] = String.split(fieldAndValue, ":")
    %{ term: %{ field => value }}
  end

  defp build_exists_query(field) do
    %{ exists: %{ field: field } }
  end

  defp build_terms_aggregation(filter) do
    { filter.field, %{ terms: %{ field: filter.field }}}
  end
end
