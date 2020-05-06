defmodule Api.Documents.Mapping do

    def map(elasticsearch_result) do
        %{
            size: elasticsearch_result.hits.total.value
        }
    end

end
