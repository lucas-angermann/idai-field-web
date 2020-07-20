defmodule Api.Documents.MockIndexAdapter do

  def post_query query do

    decoded_and_atomized = Core.Utils.atomize(Poison.decode!(query))

    hits = case decoded_and_atomized.query.bool.must.query_string.query do
      "*" -> [
               %{
                 project: "a",
                 resource: %{
                   id: "1",
                   identifier: "ident1",
                   category: "Operation",
                   groups: []
                 }
               }
             ]
      "_id:doc-of-proj-a" ->
        %{
          project: "a",
          resource: %{
            id: "1",
            identifier: "ident1",
            category: "Operation",
            groups: []
          }
        }
      "_id:doc-of-proj-b" ->
        %{
          project: "b",
          resource: %{
            id: "2",
            identifier: "ident2",
            category: "Operation",
            groups: []
          }
        }
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