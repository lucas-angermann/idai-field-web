defmodule Core.CorePropertiesAtomizing do

  @core_properties [:resource, :relations, :shortDescription, :id, :type, :identifier]

  def format_document(document) do
    document
    |> Core.Utils.atomize([:resource])
    |> Core.Utils.atomize(@core_properties, true)
  end
end