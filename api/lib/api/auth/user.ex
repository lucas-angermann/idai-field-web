defmodule User do

  @users [
    %{ name: "user-1", pass: "pass1" },
    %{ name: "user-2", pass: "pass2" },
    %{ name: "user-3", pass: "pass3" }
  ]

  def by(%{"name" => name, "pass" => pass}) do
    [found_user|_] = Enum.filter(@users, fn u -> u.name == name end)
    found_user
  end
end