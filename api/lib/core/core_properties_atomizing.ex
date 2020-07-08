defmodule Core.CorePropertiesAtomizing do

  import Core.Utils

  @core_properties [:resource, :relations, :shortDescription, :id, :type, :identifier]

  def format_document(document) do
    document
    |> atomize([:resource])
    |> atomize(@core_properties, true)
  end

  def format_changes(changes) do
    changes
    |> atomize([:doc])
    |> atomize([:doc], true)
    |> Enum.map(&(update_in(&1, [:doc], fn doc -> format_document(doc) end)))
  end
end