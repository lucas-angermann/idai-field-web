defmodule Types do

  defmodule Action do
    use TimexPoison, keys: [:date]
    defstruct [:date, :user]
  end

  defmodule Document do
    defstruct [resource: %{}, created: %Action{}, modified: [%Action{}]]
  end

  defmodule Change do
    defstruct [:changes, :deleted, :id, :seq, doc: %Document{}]
  end
end