defmodule Types do

  defmodule Action do
    use TimexPoison, keys: [:date]
    defstruct [:date, :user]
  end

  defmodule Resource do
    defstruct [:id, :type, :relations]
  end

  defmodule Document do
    defstruct [resource: %Resource{}, created: %Action{}, modified: [%Action{}]]
  end

  defmodule Change do
    defstruct [:changes, :deleted, :id, :seq, doc: %Document{}]
  end
end