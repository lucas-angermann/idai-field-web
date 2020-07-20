defmodule Api.Documents.MockIndexAdapter do

  def post_query query do

    doc_a = %{
      project: "a",
      resource: %{
        id: "1",
        identifier: "ident1",
        category: "Operation",
        groups: []
      }
    }
    doc_b = %{
      project: "b",
      resource: %{
        id: "2",
        identifier: "ident2",
        category: "Operation",
        groups: []
      }
    }

    decoded_and_atomized = Core.Utils.atomize(Poison.decode!(query))

    hits = case decoded_and_atomized.query.bool.must.query_string.query do
      "*" -> [doc_a, doc_b]
      "_id:doc-of-proj-a" -> doc_a
      "_id:doc-of-proj-b" -> doc_b
    end

    if is_list hits do
      %{ hits: %{ total: %{ value: length(hits) }, hits: Enum.map(hits, &wrap_source/1)}}
    else
      %{ "hits" => %{ "hits" => [ wrap_source(hits) ]}}
    end
  end

  defp wrap_source hit do
    %{ "_source" => hit }
  end
end