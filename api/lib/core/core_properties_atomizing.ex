defmodule Core.CorePropertiesAtomizing do

  import Core.Utils

  @core_properties [:groups, :relations, :shortDescription, :id, :type, :category, :identifier, :geometry, :gazId,
    :georeference, :parentId, :grandparentId]

  def get_core_properties(), do: @core_properties

  def format_document(document) do
    document
    |> atomize([:resource])
    |> atomize([:resource] ++ @core_properties, true)
  end

  def format_changes(changes) do
    changes
    |> atomize([:doc])
    |> atomize([:doc], true)
    |> Enum.map(&(update_in(&1, [:doc], fn doc -> format_document(doc) end)))
  end
end
