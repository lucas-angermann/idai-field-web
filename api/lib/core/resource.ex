defmodule Core.Resource do

  def get_parent_id(%{ relations: %{ "isChildOf" => [%{ "resource" => %{ "id" => id } }|_] } }), do: id
  def get_parent_id(_), do: nil

end
