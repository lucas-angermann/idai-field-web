defmodule Api.Shapes.Index do
  require Logger
  alias Api.Documents.ElasticsearchIndexAdapter

  def search_similar(model, query_vector, size, readable_projects) do
    build_query(model, query_vector, size, readable_projects)
    |> IO.inspect
    |> Poison.encode!
    |> ElasticsearchIndexAdapter.post_query
    |> Core.Utils.atomize_up_to(:_source)
  end

  defp build_query(model, query_vector, size, readable_projects) do
    %{
      query: %{
        script_score: %{
          query: %{
            bool: %{
              must: %{
                exists: %{
                  field: "resource.featureVectors.#{model}"
                }
              },
              filter: %{
                terms: %{ project: readable_projects }
              }
            }
          },
          script: %{
            source: "1 / (1 + l2norm(params.query_vector, 'resource.featureVectors.#{model}'))",
            params: %{
              query_vector: query_vector
            }
          }
        }
      },
      size: size
    }
  end

end
