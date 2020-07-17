defmodule Api.Documents.MockIndexAdapter do

  def post_query query do

    document = case (Poison.decode!(query))["query"]["bool"]["must"]["query_string"]["query"] do
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
    %{ "hits" => %{ "hits" => [%{ "_source" => document }]}}
  end
end