defmodule Core.CorePropertiesAtomizing do

  def format_document(document) do
    id = get_in(document.resource, ["id"])
  end
end