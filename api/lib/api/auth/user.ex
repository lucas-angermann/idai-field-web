defmodule User do

  @anonymous_user %{ name: "anonymous", pass: "anonymous" }

  @users [
    %{ name: "user-1", pass: "pass1" },
    %{ name: "user-2", pass: "pass2" },
    %{ name: "user-3", pass: "pass3" },
    @anonymous_user
  ]

  def anonymous, do: @anonymous_user


  def by(%{"name" => name, "pass" => pass}) do
    [found_user|_] = Enum.filter(@users, fn u -> u.name == name and u.pass == pass end) # TODO replace with comprehension
    found_user
  end

  def by(name) do
    [found_user|_] = Enum.filter(@users, fn u -> u.name == name end)
    found_user
  end
end