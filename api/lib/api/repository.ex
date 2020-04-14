defmodule Api.Repository do
  @moduledoc """
  The Repository context.
  """

  @doc """
  Returns the list of users.
  ## Examples
      iex> list_resources()
      [%Resource{}, ...]
  """
  def list_resources do
    [%{type: "abc", identifier: 123}]
  end
end