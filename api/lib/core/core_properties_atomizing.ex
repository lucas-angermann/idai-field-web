defmodule Core.CorePropertiesAtomizing do

  import Core.Utils

  @core_properties [:groups, :relations, :shortDescription, :id, :type, :category, :identifier, :geometry, :gazId,
    :georeference, :parentId, :grandparentId]

  # TODO make sure we dont forget any, since there is an interplay with [String.to_atom(config_item.name)] in scan_relation in layout.ex; review this interplay
  @relations [
    :liesWithin,
    :isRecordedIn,
    :isChildOf,
    :isAfter,
    :isBefore,
    :isContemporaryWith,
    :isAbove,
    :isBelow,
    :isEquivalentTo,
    :isInstanceof,
    :hasInstance,
    :borders,
    :cuts,
    :isCutBy,
    :depicts,
    :isDepictedIn,
    :isSameAs
  ]

  def get_core_properties(), do: @core_properties

  def format_document(document) do
    document = document
    |> atomize([:resource])
    |> atomize([:resource] ++ @core_properties, true)

    if Map.has_key?(document.resource, :relations) do
      document
      |> update_in([:resource, :relations], fn rel -> atomize(rel, @relations, true) end)
      |> update_in([:resource, :relations],
        fn rel -> for {k, v} <- rel, into: %{} do
            if is_list(v) do
              { k, Enum.map(v, fn item -> format_document(item) end) }
            else
              { k, v }
            end
          end
        end)
    else
      document
    end
  end

  def format_changes(changes) do
    changes
    |> atomize([:doc])
    |> atomize([:doc], true)
    |> Enum.map(&(update_in(&1, [:doc], fn doc -> format_document(doc) end)))
  end
end
