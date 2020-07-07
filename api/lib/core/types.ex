defmodule Types do

  defmodule Action do
    use TimexPoison, keys: [:date]
    defstruct [:date, :user]
  end

  # TODO use only Action from this module, to work with timex; get rid of the rest
  defmodule Document do
    defstruct [:project, resource: %{}, created: %Action{}, modified: [%Action{}]]
  end

  defmodule Change do
    defstruct [:changes, :deleted, :id, :seq, doc: %Document{}]
  end
end
