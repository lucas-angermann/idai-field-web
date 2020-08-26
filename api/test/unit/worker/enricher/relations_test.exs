defmodule Enricher.RelationsTest do

  use ExUnit.Case
  use Plug.Test

  alias Enricher.Relations

  test "base" do
    target_docs_map = %{
      "1" => %{
        resource: %{
          id: "1",
          identifier: "i1",
          type: "Feature",
        }
      }
    }
    %{ doc: %{ resource: %{ relations: %{ "isAbove" => targets } }}} = Relations.expand(%{
      doc: %{
        project: "proj", # todo review
        resource: %{
          id: "2",
          identifier: "i2",
          type: "Feature",
          relations: %{
            "isAbove" => ["1"]
          }
        }
      }
    }, target_docs_map)

    assert targets == [
      %{ project: "proj", resource: %{category: "Feature", id: "1", identifier: "i1" }}]
  end
end