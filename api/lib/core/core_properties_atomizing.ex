defmodule Core.CorePropertiesAtomizing do

  @core_properties [:resource, :relations, :shortDescription, :id, :type, :identifier]

  def format_document(document) do
    document
    |> (fn document -> Core.Utils.atomize(document,
                         [:resource]) end).()
    |> (fn document -> Core.Utils.atomize(document,
                         @core_properties, true) end).()
  end
end