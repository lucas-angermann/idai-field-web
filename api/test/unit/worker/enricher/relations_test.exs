defmodule Enricher.RelationsTest do

  use ExUnit.Case
  use Plug.Test

  alias Enricher.Relations

  test "base" do
    get =
      fn _ -> %{
                resource: %{
                  id: "1",
                  identifier: "i1",
                  type: "Feature",
                }
              }
      end

    %{ doc: %{ resource: %{ relations: %{ "isAbove" => targets } }}} = Relations.expand(%{
      doc: %{
        resource: %{
          id: "2",
          identifier: "i2",
          type: "Feature",
          relations: %{
            "isAbove" => ["1"]
          }
        }
      }
    }, get)

    assert targets == [
      %{ resource: %{category: "Feature", id: "1", identifier: "i1" }}]
  end
end